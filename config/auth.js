const env = require('../lib/env')

module.exports = {
  jwtExpiration: env('AUTH_JWT_EXPIRATION', '1h'),
  saltRounds: env('AUTH_SALT_ROUNDS', 10),
  secret: env('AUTH_SECRET', 'secret')
}
