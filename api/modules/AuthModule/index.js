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
    'Query.login': [notAuthenticated()],
    'Query.me': [isAuthenticated()],
    'Query.tokenRefresh': [notAuthenticated()]
  }
})
