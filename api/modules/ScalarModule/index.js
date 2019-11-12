const { GraphQLModule } = require('@graphql-modules/core')
const resolvers = require('./resolvers')
const typeDefs = require('./schema.graphql')

module.exports = new GraphQLModule({
  name: 'Scalar',
  typeDefs,
  resolvers
})
