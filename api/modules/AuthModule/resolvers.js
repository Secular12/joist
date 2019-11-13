const AppError = require('../../errors/AppError')
const bcrypt = require('bcrypt')
const DatabaseError = require('../../errors/DatabaseError')
const dayjs = require('dayjs')
const jwt = require('jsonwebtoken')
const uuidv4 = require('uuid/v4')

module.exports = {
  Mutation: {
    async login (root, { input: args }, { db, env: { auth }, ip, userAgent }) {
      // Get user by uid
      const user = await db
        .select('id', 'password')
        .from('users')
        .where('email', args.uid)
        .orWhere('username', args.uid)
        .first()

      // Throw error if cannot find user by uid
      if (!user) throw new AppError(400, 'ER_LOGIN', 'Username/email or password is not correct')

      // get new user validation token, in case one exists
      const newUserToken = await db
        .select('token')
        .from('tokens')
        .where({ type: 'new-user-validation', user_id: user.id })
        .first()

      // Throw error if there is a new user validation token
      if (newUserToken) {
        throw new AppError(401, 'ER_UNVERIFIED', 'This account has not been verified')
      }

      // match password given to the encrypted password of the user in the database
      const passwordMatch = await bcrypt.compare(args.password, user.password)

      // Throw error if passwords do not match
      if (!passwordMatch) throw new AppError(400, 'ER_LOGIN', 'Username/email or password is not correct')

      // get JTW and refresh token expiration datetimes
      const now = dayjs().utc()
      const refreshTokenExpiration = now.add(auth.refreshExpirationAmount, auth.refreshExpirationUnit).format('YYYY-MM-DD HH:mm:ss')
      const tokenExpiration = now.add(auth.jwtExpirationAmount, auth.jwtExpirationUnit).format('YYYY-MM-DD HH:mm:ss')

      // Create JWT token
      const token = jwt.sign({ userId: user.id }, auth.secret, { expiresIn: `${auth.jwtExpirationAmount} ${auth.jwtExpirationUnit}` })

      // delete other unrevoked refresh tokens for the user with the same ip and user-agent
      await db('tokens')
        .where({ ip, type: 'refresh', user_agent: userAgent, user_id: user.id })
        .whereNull('deleted_at')
        .del()

      // Generate a new refresh token
      const refreshToken = uuidv4()

      // save refresh token to the database
      await db('tokens')
        .insert({
          ip,
          token: refreshToken,
          type: 'refresh',
          user_agent: userAgent,
          user_id: user.id,
          expires_at: refreshTokenExpiration
        })

      // return JWT and refresh tokens and their expiration datetimes
      return { refreshToken, refreshTokenExpiration, token, tokenExpiration }
    },

    async reverifyNewUser (root, { input }, { db, env: { auth } }) {
      const user = await db
        .select('id')
        .from('users')
        .where({ email: input.email })
        .first()

      if (!user) {
        throw new AppError(400, 'ER_ACCOUNT_NOT_FOUND', 'There is no user found with the provided email')
      }

      const currentToken = await db
        .select('token')
        .from('tokens')
        .where({ type: 'new-user-verification', user_id: user.id })
        .first()

      if (!currentToken) {
        throw new AppError(400, 'ER_ALREADY_VERIFIED', 'A user with this email has already been verified')
      }

      await db
        .from('tokens')
        .where({ type: 'new-user-verification', user_id: user.id })
        .del()

      const newUserVerificationToken = uuidv4()

      await db('tokens')
        .insert({
          expires_at: dayjs()
            .utc()
            .add(auth.verificationExpirationAmount, auth.verificationExpirationUnit)
            .format('YYYY-MM-DD HH:mm:ss'),
          token: newUserVerificationToken,
          type: 'new-user-validation',
          user_id: user.id
        })

      // @TODO: Send Reverification email.

      return { message: 'Reverification email sent!' }
    },

    async signup (root, { input }, { db, env: { auth } }) {
      if (input.password !== input.confirmPassword) {
        throw new AppError(400, 'ER_MATCH_PASSWORDS', 'password and confirm password do not match')
      }

      let newUser

      try {
        newUser = await db('users')
          .insert({
            email: input.email,
            first_name: input.firstName,
            last_name: input.lastName,
            password: await bcrypt.hash(input.password, auth.saltRounds),
            username: input.username
          })
      } catch (error) {
        throw new DatabaseError(400, error)
      }

      const newUserVerificationToken = uuidv4()

      await db('tokens')
        .insert({
          expires_at: dayjs()
            .utc()
            .add(auth.verificationExpirationAmount, auth.verificationExpirationUnit)
            .format('YYYY-MM-DD HH:mm:ss'),
          token: newUserVerificationToken,
          type: 'new-user-validation',
          user_id: newUser[0]
        })

      // @TODO: Send verification email

      return { message: 'Signup successful!' }
    },

    async tokenRefresh (root, { input: args }, { db, env: { auth }, ip, userAgent }) {
      // set current datetime and set a formatted version for later use
      const now = dayjs().utc()
      const nowFormatted = now.format('YYYY-MM-DD HH:mm:ss')

      // find refresh token in database from the one provided
      const refreshToken = await db('tokens')
        .select('expires_at', 'ip', 'token', 'user_agent', 'user_id')
        .where({ token: args.refreshToken, type: 'refresh' })
        .whereNull('deleted_at')
        .first()

      // Throw error if refresh token doesn't exist
      if (!refreshToken) throw new AppError(401, 'ER_REFRESH_TOKEN', 'The provided refresh token is either revoked, expired, or incorrect.')

      // deconstruct properties of the refresh token
      const {
        expires_at: expiresAt,
        ip: tokenIp,
        user_agent: tokenUserAgent,
        user_id: userId
      } = refreshToken

      // delete token and return error if token is expired
      if (expiresAt < nowFormatted) {
        await db('tokens').where('token', refreshToken.token).del()

        throw new AppError(401, 'ER_REFRESH_TOKEN', 'The provided refresh token is either revoked, expired, or incorrect.')
      }

      // revoke (soft delete) token if the token's ip and user agent do not match the current one
      // This could be a sign of suspicious activite
      if (ip !== tokenIp || userAgent !== tokenUserAgent) {
        await db('tokens').update({ deleted_at: nowFormatted }).where('token', refreshToken.token)

        throw new AppError(401, 'ER_REFRESH_TOKEN', 'The provided refresh token is either revoked, expired, or incorrect.')
      }

      // get JTW and refresh token expiration datetimes
      const tokenExpiration = now.add(auth.jwtExpirationAmount, auth.jwtExpirationUnit).format('YYYY-MM-DD HH:mm:ss')
      const refreshTokenExpiration = now.add(auth.refreshExpirationAmount, auth.refreshExpirationUnit).format('YYYY-MM-DD HH:mm:ss')

      // Update expiration datetime of the refresh token
      await db('tokens')
        .update({ expires_at: refreshTokenExpiration })
        .where('token', refreshToken.token)

      // get the JWT token
      const token = jwt.sign({ userId }, auth.secret, { expiresIn: `${auth.jwtExpirationAmount} ${auth.jwtExpirationUnit}` })

      // return JWT and refresh tokens and their expiration datetimes
      return { refreshToken: refreshToken.token, refreshTokenExpiration, token, tokenExpiration }
    },

    async verifyNewUser (root, { input: args }, { db }) {
      const token = await db
        .select('token', 'expires_at')
        .where({ token: args.token, type: 'new-user-verification' })

      if (!token) throw new AppError(401, 'ER_NEW_USER_VERIFICATION_TOKEN', 'The provided verification token is either expired or incorrect.')

      if (token.expires_at < dayjs().utc().format('YYYY-MM-DD HH:mm:ss')) {
        throw new AppError(401, 'ER_NEW_USER_VERIFICATION_TOKEN', 'The provided verification token is either expired or incorrect.')
      }

      await db('tokens')
        .where('token', token.token)
        .del()

      return { message: 'User has been successfully verified' }
    }
  },
  Query: {
    me (root, args, context) {
      return context.currentUser
    }
  },
  // Computed
  User: {
    firstName (user, _, context) {
      return user.first_name
    },
    lastName (user, _, context) {
      return user.last_name
    }
  }
}
