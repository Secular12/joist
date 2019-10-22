const AuthProvider = require('../AuthModule/provider')
const { GraphQLModule } = require('@graphql-modules/core')
const env = require('../../../config')
const db = require('../../../db')

module.exports = new GraphQLModule({
  async context ({ request }, _, { injector }) {
    const currentUser = injector.get(AuthProvider).getUserById(request, env)

    return {
      currentUser,
      env,
      db
    }
  },
  providers: [
    AuthProvider
  ],
})
