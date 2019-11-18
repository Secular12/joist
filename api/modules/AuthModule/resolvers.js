const AppError = require('../../errors/AppError')
const AuthProvider = require('./provider')
const bcrypt = require('bcrypt')
// const DatabaseError = require('../../errors/DatabaseError')
const UserProvider = require('../UserModule/provider')

module.exports = {
  Mutation: {
    async login (root, { input: args }, { db, env: { auth }, injector, userAgent }) {
      // Get user by uid
      const user = await injector.get(UserProvider).getUserByUid(args.uid)

      // Throw error if cannot find user by uid
      if (!user) throw new AppError(400, 'ER_LOGIN', 'Username/email or password is not correct')

      // get new user validation token, in case one exists
      const newUserToken = await injector.get(AuthProvider).getNewUserTokenByUserId(user.id)

      // Throw error if there is a new user validation token
      if (newUserToken) {
        throw new AppError(401, 'ER_UNVERIFIED', 'This account has not been verified')
      }

      // match password given to the encrypted password of the user in the database
      const passwordMatch = await bcrypt.compare(args.password, user.password)

      // Throw error if passwords do not match
      if (!passwordMatch) throw new AppError(400, 'ER_LOGIN', 'Username/email or password is not correct')

      // Generate JWT token
      const { token, tokenExpiration } = injector.get(AuthProvider).generateJwtToken(user.id)

      // delete other unrevoked refresh tokens for the user with the same user-agent
      await injector.get(AuthProvider).deleteRefreshTokens(user.id, userAgent)

      // Create Refresh Token
      const { refreshToken, refreshTokenExpiration } = await injector.get(AuthProvider).createRefreshTokens(user.id, userAgent)

      // return JWT and refresh tokens and their expiration datetimes
      return { refreshToken, refreshTokenExpiration, token, tokenExpiration }
    },

    async reverifyNewUser (root, { input }, { db, env: { auth }, injector }) {
      // Get user by email
      const user = await injector.get(UserProvider).getUserBy({ email: input.email })

      // Throw error if could not find user by email
      if (!user) {
        throw new AppError(400, 'ER_ACCOUNT_NOT_FOUND', 'There is no user found with the provided email')
      }

      // gFind new user verification token by user
      const currentToken = await injector.get(AuthProvider).getNewUserTokenByUserId(user.id)

      // Throw error if no new user verification token exists, as that only occurs if they are already verified
      if (!currentToken) {
        throw new AppError(400, 'ER_ALREADY_VERIFIED', 'A user with this email has already been verified')
      }

      // Delete any current new user verification tokens, including any that may have been revoked
      await injector.get(AuthProvider).deleteNewUserTokens(user.id, -1)

      // Create another new user verification tokens
      await injector.get(AuthProvider).createNewUserToken(user.id)

      // @TODO: Send Reverification email.

      // return message indication reverification has completed
      return { message: 'Reverification email sent!' }
    },

    async signup (root, { input }, { db, env: { auth }, injector }) {
      // Throw error if password and confirm password do not match
      if (input.password !== input.confirmPassword) {
        throw new AppError(400, 'ER_MATCH_PASSWORDS', 'password and confirm password do not match')
      }

      // create new user with provided data
      const newUser = await injector.get(UserProvider).createUser(input)

      // create new user token
      await injector.get(AuthProvider).createNewUserToken(newUser[0])

      // @TODO: Send verification email

      // return message indicating that sign up was successful
      return { message: 'Signup successful!' }
    },

    async tokenRefresh (root, { input: args }, { db, env: { auth }, injector, userAgent }) {
      // find refresh token in database from the one provided
      const refreshToken = await injector.get(AuthProvider).getRefreshToken(args.refreshToken)

      // Throw error if refresh token doesn't exist
      if (!refreshToken) throw new AppError(401, 'ER_REFRESH_TOKEN', 'The provided refresh token is either revoked, expired, or incorrect.')

      // delete token and return error if token is expired
      if (injector.get(AuthProvider).isTokenExpired(refreshToken)) {
        await injector.get(AuthProvider).deleteToken(args.refreshToken)

        throw new AppError(401, 'ER_REFRESH_TOKEN', 'The provided refresh token is either revoked, expired, or incorrect.')
      }

      // revoke (soft delete) token if the token's user agent does not match the current one
      // This could be a sign of suspicious activite
      if (userAgent !== refreshToken.user_agent) {
        await injector.get(AuthProvider).revokeRefreshToken(args.refreshToken)

        throw new AppError(401, 'ER_REFRESH_TOKEN', 'The provided refresh token is either revoked, expired, or incorrect.')
      }

      // Update expiration datetime of the refresh token
      const refreshTokenExpiration = await injector.get(AuthProvider).updateRefreshTokenExpiration(args.refreshToken)

      // get the JWT token
      const { token, tokenExpiration } = injector.get(AuthProvider).generateJwtToken(refreshToken.user_id)

      // return JWT and refresh tokens and their expiration datetimes
      return { refreshToken: refreshToken.token, refreshTokenExpiration, token, tokenExpiration }
    },

    async verifyNewUser (root, { input: args }, { db, injector }) {
      // find new user token by one provided
      const token = await injector.get(AuthProvider).getNewUserToken(args.token)

      // throw error if new user token could not be found
      if (!token) throw new AppError(401, 'ER_NEW_USER_VERIFICATION_TOKEN', 'The provided verification token is either expired or incorrect.')

      // throw error if new user token is expired
      if (injector.get(AuthProvider).isTokenExpired(token)) {
        throw new AppError(401, 'ER_NEW_USER_VERIFICATION_TOKEN', 'The provided verification token is either expired or incorrect.')
      }

      // delete new user token
      await injector.get(AuthProvider).deleteToken(token)

      // return message that user has been verified
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
