const { Injectable } = require('@graphql-modules/di')

class AuthProvider {
  getCurrentUser (request, env) {
    const authToken = request.headers.authorization
    let currentUser

    if (authToken) {
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
