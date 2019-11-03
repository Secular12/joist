const ContextModule = require('../ContextModule')
const { GraphQLModule } = require('@graphql-modules/core')
const notAuthenticated = require('../../compositions/notAuthenticated')
const resolvers = require('./resolvers')
const typeDefs = require('./schema.graphql')

module.exports = new GraphQLModule({
  imports: [ContextModule],
  name: 'Auth',
  typeDefs,
  resolvers,
  resolversComposition: {
    'Query.login': [notAuthenticated()]
  }
})
