const UserProvider = require('./provider.js')

module.exports = {
  Query: {
    users (root, args, { injector }) {
      return injector.get(UserProvider).getUsers()
    },
    user (root, { id }, { injector }) {
      return injector.get(UserProvider).getUserById(id)
    }
  }
}
