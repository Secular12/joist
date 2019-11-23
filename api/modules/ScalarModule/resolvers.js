const TypeError = require('../../errors/TypeError')
const GraphQLInputString = require('graphql-input-string')

module.exports = {
  // @TODO: figure out how to update the error messages.
  // Should include the input property if possible
  Email: GraphQLInputString({
    error (info) {
      if (info.type === 'pattern') {
        throw new TypeError('not in an email format')
      }
      throw new TypeError(info.message)
    },
    name: 'Email',
    pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
    trim: true
  }),

  Password: GraphQLInputString({
    error (info) {
      if (info.type === 'pattern') {
        throw new TypeError('must have 1 lowercase letter, 1 uppercase letter, 1 number, and 1 of the following characters: !@#$%^&*')
      }
      throw new TypeError(info.message)
    },
    max: 100,
    min: 8,
    name: 'Password',
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
    trim: true
  }),

  TrimmedString: GraphQLInputString({
    name: 'TrimmedString',
    trim: true
  }),

  Username: GraphQLInputString({
    error (info) {
      if (info.type === 'pattern') {
        throw new TypeError('cannot be an email address')
      }
      throw new TypeError(info.message)
    },
    name: 'Username',
    pattern: /^((?![a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]).)*$/,
    trim: true
  })
}
