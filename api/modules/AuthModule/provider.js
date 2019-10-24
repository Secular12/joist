const { Injectable } = require('@graphql-modules/di')
const jwt = require('jsonwebtoken')

class AuthProvider {
  getCurrentUser ({ headers }, env) {
    const isAuthToken = headers.authorization && headers.authorization.startsWith('Bearer ')
    let currentUser

    if (isAuthToken) {
      const authToken = headers.authorization.split('Bearer ')[1]

      jwt.verify(authToken, env.app.secret, async (error, { userId: id }) => {
        if (!error) {
          const user = await db.select().where('id', id).from('users')
          currentUser = user
        }
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
