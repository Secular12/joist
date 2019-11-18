module.exports = class AppError extends Error {
  constructor (status, code, message) {
    super()
    this.code = code || 'ER_APP'
    this.message = message || 'There was an app error'
    this.status = status || 400
  }
}
