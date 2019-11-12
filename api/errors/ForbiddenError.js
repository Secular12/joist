module.exports = class ForbiddenError extends Error {
  constructor (code, message) {
    super()
    this.code = code || 'ER_FORBIDDEN'
    this.message = message || 'This content is forbidden'
    this.status = 403
  }
}
