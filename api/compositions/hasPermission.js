module.exports = (action, scope, moduleName) => next => async (root, args, context, info) => {
  if (!context.currentUser) {
    throw new Error('You are not authenticated!')
  }

  if (!context.currentUser.permissions) {
    throw new Error('You are not authorized!')
  }

  if (!context.currentUser.permissions.some(permission => {
    return permission.action === action &&
    permission.scope === scope &&
    permission.module === moduleName
  })) {
    throw new Error('You are not authorized!')
  }

  return next(root, args, context, info)
}
