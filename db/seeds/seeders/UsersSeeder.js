const faker = require('faker')
const runFactory = require('../../lib/runFactory')

const userFactory = () => ({
  email: faker.internet.email(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  password: 'secret',
  username: faker.internet.userName()
})

module.exports = async knex => {
  await knex('users')
    .insert([
      {
        email: 'test-admin@example.com',
        first_name: 'Test',
        last_name: 'Admin',
        password: 'secret',
        username: 'testadmin'
      },
      ...runFactory(userFactory, 10)
    ])
}
