const runFactory = require('../../lib/runFactory')

const usersRolesFactory = i => ({
  role_id: 2,
  user_id: i + 1
})

module.exports = async knex => {
  await knex('users_roles')
    .insert([
      {
        role_id: 1,
        user_id: 1
      },
      ...await runFactory(usersRolesFactory, 10)
    ])
}
