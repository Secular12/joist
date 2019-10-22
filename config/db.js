const env = require('../lib/env')

module.exports = {
  client: env('DB_CLIENT', 'mysql'),
  database: env('DB_DATABASE', 'app'),
  host: env('DB_HOST', '127.0.0.1'),
  password: env('DB_PASSWORD', ''),
  port: env('DB_PORT', 3306),
  timezone: env('DB_TIMEZONE', '+00:00'),
  user: env('DB_USER', 'root')
}
