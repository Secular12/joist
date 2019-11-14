const AppError = require('../../errors/AppError')
const db = require('../../../db')
const { auth: { secret } } = require('../../../config')
const { Injectable } = require('@graphql-modules/di')
const jwt = require('jsonwebtoken')
const deduplicate = require('../../../lib/js/deduplicate')

class AuthProvider {
  async getCurrentUser ({ headers }) {
    const isAuthToken = headers.authorization && headers.authorization.startsWith('Bearer ')
    let currentUser

    if (isAuthToken) {
      const authToken = headers.authorization.split('Bearer ')[1]

      await jwt.verify(authToken, secret, async (error, payload) => {
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
}

module.exports = Injectable({})(AuthProvider)
