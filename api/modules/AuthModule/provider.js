const AppError = require('../../errors/AppError')
const { auth } = require('../../../config')
const bcrypt = require('bcrypt')
const dayjs = require('dayjs')
const db = require('../../../db')
const deduplicate = require('../../../lib/js/deduplicate')
const { Injectable } = require('@graphql-modules/di')
const jwt = require('jsonwebtoken')
const uuidv4 = require('uuid/v4')
const withTrashed = require('../../../db/lib/modifiers/withTrashed')

class AuthProvider {
  async createForgotPasswordToken (userId) {
    const forgotPasswordToken = uuidv4()

    await db('tokens')
      .insert({
        expires_at: dayjs()
          .utc()
          .add(auth.verificationExpirationAmount, auth.verificationExpirationUnit)
          .format('YYYY-MM-DD HH:mm:ss'),
        token: forgotPasswordToken,
        type: 'forgot-password',
        user_id: userId
      })
  }

  async createNewUserToken (userId) {
    const newUserVerificationToken = uuidv4()

    await db('tokens')
      .insert({
        expires_at: dayjs()
          .utc()
          .add(auth.verificationExpirationAmount, auth.verificationExpirationUnit)
          .format('YYYY-MM-DD HH:mm:ss'),
        token: newUserVerificationToken,
        type: 'new-user-verification',
        user_id: userId
      })
  }

  async createRefreshToken (userId, userAgent) {
    const refreshToken = uuidv4()
    const refreshTokenExpiration = dayjs()
      .utc()
      .add(auth.refreshExpirationAmount, auth.refreshExpirationUnit)
      .format('YYYY-MM-DD HH:mm:ss')

    // save refresh token to the database
    await db('tokens')
      .insert({
        token: refreshToken,
        type: 'refresh',
        user_agent: userAgent,
        user_id: userId,
        expires_at: refreshTokenExpiration
      })

    return { refreshToken, refreshTokenExpiration }
  }

  async deleteTokensByUserId (type, userId, includeTrashed) {
    await db('tokens')
      .where({ type, user_id: userId })
      .modify(withTrashed, includeTrashed)
      .del()
  }

  async deleteRefreshTokensByUserId (userId, userAgent, includeTrashed) {
    await db('tokens')
      .where({ type: 'refresh', user_agent: userAgent, user_id: userId })
      .modify(withTrashed, includeTrashed)
      .del()
  }

  async deleteToken (token, includeTrashed) {
    await db('tokens').where('token', token).modify(withTrashed, includeTrashed).del()
  }

  generateJwtToken (userId) {
    const token = jwt.sign({ userId }, auth.secret, { expiresIn: `${auth.jwtExpirationAmount} ${auth.jwtExpirationUnit}` })
    const tokenExpiration = dayjs()
      .utc()
      .add(auth.jwtExpirationAmount, auth.jwtExpirationUnit)
      .format('YYYY-MM-DD HH:mm:ss')

    return { token, tokenExpiration }
  }

  async getCurrentUser ({ headers }) {
    // @TODO: Refactor once roles and permissions are added
    const isAuthToken = headers.authorization && headers.authorization.startsWith('Bearer ')
    let currentUser

    if (isAuthToken) {
      const authToken = headers.authorization.split('Bearer ')[1]

      await jwt.verify(authToken, auth.secret, async (error, payload) => {
        if (error) throw new AppError(400, 'ER_JWT', error.message)

        const { userId: id } = payload
        currentUser = await db('users')
          .select(
            'id',
            'email',
            'first_name',
            'last_name',
            'username',
            'created_at',
            'updated_at'
          )
          .where('id', id)
          .whereNull('deleted_at')
          .first()

        currentUser.roles = await db('users_roles')
          .join('roles', 'roles.id', 'users_roles.role_id')
          .select('roles.id', 'roles.name')
          .where('users_roles.user_id', id)
          .whereNull('roles.deleted_at')

        const permissions = await db('roles_permissions')
          .select('action', 'module', 'scope')
          .whereIn('role_id', currentUser.roles.map(role => role.id))
          .whereNull('deleted_at')

        // deduplicate permissions
        currentUser.permissions = deduplicate(permissions)
      })

      if (!currentUser) {
        throw new AppError(401, 'ER_INVALID_JWT', 'Invalid JWT Token')
      }

      return currentUser
    }

    return null
  }

  async getNewUserTokenByUserId (userId, includeTrashed) {
    return db('tokens')
      .select()
      .where({ type: 'new-user-verification', user_id: userId })
      .modify(withTrashed, includeTrashed)
      .first()
  }

  async getToken (token, includeTrashed) {
    return db('tokens')
      .select()
      .where({ token })
      .modify(withTrashed, includeTrashed)
      .first()
  }

  isTokenExpired (token) {
    return token.expires_at < dayjs().utc().format('YYYY-MM-DD HH:mm:ss')
  }

  async revokeRefreshToken (refreshToken, includeTrashed) {
    await db('tokens')
      .update({ deleted_at: dayjs().utc().format('YYYY-MM-DD HH:mm:ss') })
      .where('token', refreshToken)
      .modify(withTrashed, includeTrashed)
  }

  async updatePassword (userId, password) {
    await db('users')
      .update({ password: await bcrypt.hash(password, auth.saltRounds) })
      .where('id', userId)
  }

  async updateRefreshTokenExpiration (refreshToken, includeTrashed) {
    const refreshTokenExpiration = dayjs()
      .utc()
      .add(auth.refreshExpirationAmount, auth.refreshExpirationUnit)
      .format('YYYY-MM-DD HH:mm:ss')

    await db('tokens')
      .update({ expires_at: refreshTokenExpiration })
      .where('token', refreshToken)
      .modify(withTrashed, includeTrashed)

    return refreshTokenExpiration
  }
}

module.exports = Injectable({})(AuthProvider)
