const ContextModule = require('../ContextModule')
const { GraphQLModule } = require('@graphql-modules/core')
const isAuthenticated = require('../../compositions/isAuthenticated')
const notAuthenticated = require('../../compositions/notAuthenticated')
const resolvers = require('./resolvers')
const typeDefs = require('./schema.graphql')

module.exports = new GraphQLModule({
  imports: [ContextModule],
  name: 'Auth',
  typeDefs,
  resolvers,
  resolversComposition: {
    'Mutation.login': [notAuthenticated()],
    'Mutation.signup': [notAuthenticated()],
    'Mutation.tokenRefresh': [notAuthenticated()],
    'Mutation.verifyNewUser': [notAuthenticated()],
    'Query.me': [isAuthenticated()]
  }
})
