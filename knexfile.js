const {
  db: {
    client,
    database,
    host,
    password,
    timezone,
    user
  }
} = require('./config')

module.exports = {
  client,
  connection: {
    host,
    user,
    password,
    database
  },
  migrations: {
    directory: './db/migrations'
  },
  pool: {
    afterCreate (connection, done) {
      connection.query(`SET time_zone="${timezone}";`, err => {
        done(err, connection)
      })
    }
  },
  seeds: {
    directory: './db/seeds'
  }
}
