module.exports = async knex => {
  await knex('roles')
    .insert([
      { name: 'Admin' },
      { name: 'Customer' }
    ])
}
