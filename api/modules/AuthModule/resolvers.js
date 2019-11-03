const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports = {
  Query: {
    async login (root, args, context) {
      const user = await context.db
        .select('id', 'password')
        .where('email', args.uid)
        .orWhere('username', args.uid)
        .from('users')
        .first()

      if (!user) throw new Error('Provided username or email does not match our records.')

      const passwordMatch = await bcrypt.compare(args.password, user.password)

      if (!passwordMatch) throw new Error('Incorrect password.')

      const token = jwt.sign({ userId: user.id }, context.env.auth.secret, { expiresIn: context.env.auth.jwtExpiration })

      return { token }
    },
    me (root, args, context) {
      return context.currentUser
    }
  },
  // Computed
  User: {
    firstName (user, _, context) {
      return user.first_name
    },
    lastName (user, _, context) {
      return user.last_name
    }
  }
}
