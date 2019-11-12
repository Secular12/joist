module.exports = class DatabaseError extends Error {
  constructor (status, err, customMessage, customCode) {
    super()
    this.code = customCode || err.code || 'ER_DB'
    this.message = customMessage || err.sqlMessage || 'There was a database error'
    this.status = status
  }
}
