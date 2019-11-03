const db = require('../../../db')
const env = require('../../../config')
const { Injectable } = require('@graphql-modules/di')
const jwt = require('jsonwebtoken')
const { uniq } = require('lodash')

class AuthProvider {
  async getCurrentUser ({ headers }) {
    const isAuthToken = headers.authorization && headers.authorization.startsWith('Bearer ')
    let currentUser

    if (isAuthToken) {
      const authToken = headers.authorization.split('Bearer ')[1]

      await jwt.verify(authToken, env.app.secret, async (error, payload) => {
        if (error) throw new Error(error)

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
          .where('id', id)
          .whereNull('deleted_at')
          .from('users')
          .first()

        currentUser.roles = await db('users_roles')
          .join('roles', 'roles.id', 'users_roles.role_id')
          .select('roles.id', 'roles.name')
          .where('users_roles.user_id', id)
          .whereNull('roles.deleted_at')

        const permissions = await db
          .select('action', 'module', 'scope')
          .whereIn('role_id', currentUser.roles.map(role => role.id))
          .whereNull('deleted_at')
          .from('roles_permissions')

        // deduplicate permissions
        currentUser.permissions = uniq(permissions
          .map(permission => JSON.stringify(permission))
        )
          .map(permission => JSON.parse(permission))
      })

      if (!currentUser) {
        throw new Error('Invalid JWT Token')
      }

      return currentUser
    }

    return null
  }
}

module.exports = Injectable({})(AuthProvider)
