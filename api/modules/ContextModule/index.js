const { GraphQLModule } = require('@graphql-modules/core')
const env = require('../../../config')
const db = require('../../../db')
const jwt = require('jsonwebtoken')

module.exports = new GraphQLModule({
  async context ({ request }) {
    const authToken = request.headers.authorization
    let currentUser = null

    if (authToken) {
      jwt.verify(authToken, env.app.secret, async (error, { userId: id }) => {
        if (error) throw new Error(error)

        const user = await db.select().where('id', id).from('users')

        currentUser = {
          ...user,
          role: {
            test: true
          }
        }
      })
    }

    return {
      currentUser,
      env,
      db
    }
  }
})
