module.exports = (rolePermission, check = '=', match = true) => next => async (root, args, context, info) => {
  // @TODO: Do an access check
  if (!context.currentUser) {
    throw new Error('You are not authenticated!')
  }

  if (!context.currentUser.role) {
    throw new Error('You are not authorized!')
  }

  switch (check) {
    case '=':
      if (context.currentUser.role[rolePermission] === match) {
        return next(root, args, context, info)
      }
      throw new Error('You are not authorized!')
    case '!=':
      if (context.currentUser.role[rolePermission] !== match) {
        return next(root, args, context, info)
      }
      throw new Error('You are not authorized!')
    default:
      throw new Error('You are not authorized!')
  }
}
