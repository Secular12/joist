const jwt = require('jsonwebtoken')

module.exports = {
  Query: {
    login (root, args, context) {
      const token = jwt.sign({ userId: 1 }, context.env.app.secret, { expiresIn: '1h' })
      return { token }
    },
    me (root, args, context) {
      return context.currentUser
    }
  },
  // Computed
  User: {
    id (user, _, context) {
      return user._id
    }
  }
}
