module.exports = async knex => {
  await knex('modules')
    .insert([
      { name: 'permissions' },
      { name: 'roles' },
      { name: 'users' }
    ])
}
