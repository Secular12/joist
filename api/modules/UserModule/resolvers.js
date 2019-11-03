const UserProvider = require('./provider.js')

module.exports = {
  Query: {
    async users (root, args, { injector }) {
      return injector.get(UserProvider).getUsers()
    },
    async user (root, { id }, { injector }) {
      return injector.get(UserProvider).getUserById(id)
    }
  }
}
