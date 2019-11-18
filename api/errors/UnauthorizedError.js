module.exports = class UnauthorizedError extends Error {
  constructor (message) {
    super()
    this.code = 'ER_UNAUTHORIZED'
    this.message = message || 'This content is not available for unauthorized users'
    this.status = 401
  }
}
