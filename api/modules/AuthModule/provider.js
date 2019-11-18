const AppError = require('../../errors/AppError')
const { auth } = require('../../../config')
const dayjs = require('dayjs')
const db = require('../../../db')
const deduplicate = require('../../../lib/js/deduplicate')
const { Injectable } = require('@graphql-modules/di')
const jwt = require('jsonwebtoken')
const uuidv4 = require('uuid/v4')
const softDelete = require('../../../db/lib/modifiers/softDelete')

class AuthProvider {
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

  async deleteNewUserTokens (userId, includeSoftDelete) {
    await db
      .from('tokens')
      .where({ type: 'new-user-verification', user_id: userId })
      .modify(softDelete, includeSoftDelete)
      .del()
  }

  async deleteRefreshTokens (userId, userAgent, includeSoftDelete) {
    await db('tokens')
      .where({ type: 'refresh', user_agent: userAgent, user_id: userId })
      .modify(softDelete, includeSoftDelete)
      .del()
  }

  async deleteToken (token, includeSoftDelete) {
    await db('tokens').where('token', token).modify(softDelete, includeSoftDelete).del()
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
        currentUser = await db
          .select(
            'id',
            'email',
            'first_name',
            'last_name',
            'username',
            'created_at',
            'updated_at'
          )
          .from('users')
          .where('id', id)
          .whereNull('deleted_at')
          .first()

        currentUser.roles = await db('users_roles')
          .join('roles', 'roles.id', 'users_roles.role_id')
          .select('roles.id', 'roles.name')
          .where('users_roles.user_id', id)
          .whereNull('roles.deleted_at')

        const permissions = await db
          .select('action', 'module', 'scope')
          .from('roles_permissions')
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

  async getNewUserToken (newUserToken, includeSoftDelete) {
    return db
      .select('token', 'expires_at')
      .where({ token: newUserToken, type: 'new-user-verification' })
      .modify(softDelete, includeSoftDelete)
  }

  async getNewUserTokenByUserId (userId, includeSoftDelete) {
    return db
      .select('token')
      .from('tokens')
      .where({ type: 'new-user-validation', user_id: userId })
      .modify(softDelete, includeSoftDelete)
      .first()
  }

  async getRefreshToken (refreshToken, includeSoftDelete) {
    return db('tokens')
      .select()
      .where({ token: refreshToken, type: 'refresh' })
      .modify(softDelete, includeSoftDelete)
      .first()
  }

  isTokenExpired (token) {
    return token.expires_at < dayjs().utc().format('YYYY-MM-DD HH:mm:ss')
  }

  async revokeRefreshToken (refreshToken, includeSoftDelete) {
    await db('tokens')
      .update({ deleted_at: dayjs().utc().format('YYYY-MM-DD HH:mm:ss') })
      .where('token', refreshToken)
      .modify(softDelete, includeSoftDelete)
  }

  async updateRefreshTokenExpiration (refreshToken, includeSoftDelete) {
    const refreshTokenExpiration = dayjs()
      .utc()
      .add(auth.refreshExpirationAmount, auth.refreshExpirationUnit)
      .format('YYYY-MM-DD HH:mm:ss')

    await db('tokens')
      .update({ expires_at: refreshTokenExpiration })
      .where('token', refreshToken)
      .modify(softDelete, includeSoftDelete)

    return refreshTokenExpiration
  }
}

module.exports = Injectable({})(AuthProvider)
