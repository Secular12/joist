const AppError = require('../errors/AppError')

module.exports = () => next => async (root, args, context, info) => {
  if (context.currentUser) {
    throw new AppError(403, 'ER_GUEST_ONLY', 'This content is forbidden to authenticated users')
  }

  return next(root, args, context, info)
}
