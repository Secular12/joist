const env = require('../lib/env')

module.exports = {
  graphiql: env('APP_GRAPHIQL', false),
  host: env('APP_HOST', '127.0.0.1'),
  path: env('APP_PATH', '/api'),
  port: env('APP_PORT', 4000),
  secret: env('APP_SECRET', 'secret')
}
