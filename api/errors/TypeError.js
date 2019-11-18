const { GraphQLError } = require('graphql')

module.exports = class TypeError extends GraphQLError {
  constructor (message) {
    super()
    this.code = 'E_TYPE_VALIDATION'
    this.message = message || 'Type Validation Error'
    this.status = 400
  }
}
