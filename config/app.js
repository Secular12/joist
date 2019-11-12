const env = require('../lib/env')

module.exports = {
  environment: env('APP_ENVIRONMENT', 'development'),
  graphiql: env('APP_GRAPHIQL', false),
  host: env('APP_HOST', '127.0.0.1'),
  path: env('APP_PATH', '/api'),
  port: env('APP_PORT', 4000)
}
