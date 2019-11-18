const UnauthorizedError = require('../errors/UnauthorizedError')

module.exports = () => next => async (root, args, context, info) => {
  if (!context.currentUser) {
    throw new UnauthorizedError()
  }

  return next(root, args, context, info)
}
