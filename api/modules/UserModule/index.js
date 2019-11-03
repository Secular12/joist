const AuthModule = require('../AuthModule')
const { GraphQLModule } = require('@graphql-modules/core')
const typeDefs = require('./schema.graphql')
const resolvers = require('./resolvers')
const UserProvider = require('./provider.js')

const hasPermission = require('../../compositions/hasPermission')

module.exports = new GraphQLModule({
  imports: [AuthModule],
  name: 'User',
  typeDefs,
  providers: [
    UserProvider
  ],
  resolvers,
  resolversComposition: {
    'Query.users': [hasPermission('test')]
  }
})
