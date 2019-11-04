const bcrypt = require('bcrypt')
const dayjs = require('dayjs')
const jwt = require('jsonwebtoken')
const uuidv4 = require('uuid/v4')

module.exports = {
  Query: {
    async login (root, args, { db, env: { auth }, ip, userAgent }) {
      // Get user by uid
      const user = await db
        .select('id', 'password')
        .where('email', args.uid)
        .orWhere('username', args.uid)
        .from('users')
        .first()

      // Throw error if cannot find user by uid
      if (!user) throw new Error('Username/email or password is not correct.')

      // match password given to the encrypted password of the user in the database
      const passwordMatch = await bcrypt.compare(args.password, user.password)

      // Throw error if passwords do not match
      if (!passwordMatch) throw new Error('Username/email or password is not correct.')

      // get JTW and refresh token expiration datetimes
      const now = dayjs().utc()
      const refreshTokenExpiration = now.add(auth.refreshExpirationAmount, auth.refreshExpirationUnit).format('YYYY-MM-DD HH:mm:ss')
      const tokenExpiration = now.add(auth.jwtExpirationAmount, auth.jwtExpirationUnit).format('YYYY-MM-DD HH:mm:ss')

      // Create JWT token
      const token = jwt.sign({ userId: user.id }, auth.secret, { expiresIn: `${auth.jwtExpirationAmount} ${auth.jwtExpirationUnit}` })

      // delete other unrevoked refresh tokens for the user with the same ip and user-agent
      await db('tokens')
        .where({ ip, user_agent: userAgent, user_id: user.id })
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

    me (root, args, context) {
      return context.currentUser
    },

    async tokenRefresh (root, args, { db, env: { auth }, ip, userAgent }) {
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
      if (!refreshToken) throw new Error('The provided refresh token is either revoked, expired, or incorrect.')

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

        throw new Error('The provided refresh token is either revoked, expired, or incorrect.')
      }

      // revoke (soft delete) token if the token's ip and user agent do not match the current one
      // This could be a sign of suspicious activite
      if (ip !== tokenIp || userAgent !== tokenUserAgent) {
        await db('tokens').update({ deleted_at: nowFormatted }).where('token', refreshToken.token)

        throw new Error('The provided refresh token is either revoked, expired, or incorrect.')
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
