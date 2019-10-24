require('graphql-import-node/register')
require('reflect-metadata')

require('dotenv').config()

const { app: { graphiql, host, path: apiPath, port } } = require('./config')
const express = require('express')
const graphqlHTTP = require('express-graphql')
const { GraphQLModule } = require('@graphql-modules/core')
const importModules = require('./lib/importModules')
const { join } = require('path')

const app = express()

require('./db')

const AppModule = new GraphQLModule({
  name: 'App',
  imports: [...importModules(join(__dirname, './api/modules'))]
})

const { schema } = AppModule

app.use(apiPath, graphqlHTTP({
  graphiql,
  schema
}))

app.listen(port, host, () => {
  console.log(`listening to ${host}:${port}`)
})
