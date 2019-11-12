const env = require('../lib/env')

module.exports = {
  jwtExpirationAmount: env('AUTH_JWT_EXPIRATION_AMOUNT', 1),
  jwtExpirationUnit: env('AUTH_JWT_EXPIRATION_UNIT', 'hour'),
  refreshExpirationAmount: env('AUTH_REFRESH_EXPIRATION_AMOUNT', 1),
  refreshExpirationUnit: env('AUTH_REFRESH_EXPIRATION_UNIT', 'week'),
  saltRounds: env('AUTH_SALT_ROUNDS', 10),
  secret: env('AUTH_SECRET', 'secret'),
  verificationExpirationAmount: env('AUTH_VERIFICATION_EXPIRATION_AMOUNT', 1),
  verificationExpirationUnit: env('AUTH_VERIFICATION_EXPIRATION_AMOUNT', 'day')
}
