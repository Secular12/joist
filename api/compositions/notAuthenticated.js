module.exports = () => next => async (root, args, context, info) => {
  if (context.currentUser) {
    throw new Error('You are already logged in!')
  }

  return next(root, args, context, info)
}
