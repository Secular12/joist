const UnauthorizedError = require('../errors/UnauthorizedError')
const ForbiddenError = require('../errors/ForbiddenError')

module.exports = (action, scope, moduleName) => next => async (root, args, context, info) => {
  if (!context.currentUser) {
    throw new UnauthorizedError()
  }

  if (!context.currentUser.permissions) {
    throw new ForbiddenError()
  }

  if (!context.currentUser.permissions.some(permission => {
    return permission.action === action &&
    permission.scope === scope &&
    permission.module === moduleName
  })) {
    throw new ForbiddenError()
  }

  return next(root, args, context, info)
}
