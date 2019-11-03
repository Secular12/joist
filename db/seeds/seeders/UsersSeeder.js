const bcrypt = require('bcrypt')
const config = require('../../../config')
const faker = require('faker')
const runFactory = require('../../lib/runFactory')

const userFactory = async () => ({
  email: faker.internet.email(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  password: await bcrypt.hash('secret', config.auth.saltRounds),
  username: faker.internet.userName()
})

module.exports = async knex => {
  await knex('users')
    .insert([
      {
        email: 'test-admin@example.com',
        first_name: 'Test',
        last_name: 'Admin',
        password: await bcrypt.hash('secret', config.auth.saltRounds),
        username: 'testadmin'
      },
      ...await runFactory(userFactory, 10)
    ])
}
