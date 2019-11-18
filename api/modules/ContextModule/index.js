const AuthProvider = require('../AuthModule/provider')
const { GraphQLModule } = require('@graphql-modules/core')
const env = require('../../../config')
const db = require('../../../db')
const ScalarModule = require('../ScalarModule')

module.exports = new GraphQLModule({
  async context (session, _, { injector }) {
    const currentUser = await injector.get(AuthProvider).getCurrentUser(session)

    return {
      currentUser,
      db,
      env,
      userAgent: session.headers['user-agent']
    }
  },
  imports: [ScalarModule],
  providers: [
    AuthProvider
  ]
})
