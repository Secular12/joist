const AuthProvider = require('./provider')
const ContextModule = require('../ContextModule')
const { GraphQLModule } = require('@graphql-modules/core')
const isAuthenticated = require('../../compositions/isAuthenticated')
const notAuthenticated = require('../../compositions/notAuthenticated')
const resolvers = require('./resolvers')
const typeDefs = require('./schema.graphql')
const UserProvider = require('../UserModule/provider')

module.exports = new GraphQLModule({
  imports: [ContextModule],
  name: 'Auth',
  providers: [
    AuthProvider,
    UserProvider
  ],
  typeDefs,
  resolvers,
  resolversComposition: {
    'Mutation.forgotPassword': [notAuthenticated()],
    'Mutation.login': [notAuthenticated()],
    'Mutation.reverifyNewUser': [notAuthenticated()],
    'Mutation.signup': [notAuthenticated()],
    'Mutation.tokenRefresh': [notAuthenticated()],
    'Mutation.unverifyNewUser': [notAuthenticated()],
    'Mutation.updatePassword': [],
    'Mutation.verifyNewUser': [notAuthenticated()],
    'Query.me': [isAuthenticated()]
  }
})
