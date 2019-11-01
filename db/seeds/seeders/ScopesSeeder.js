module.exports = async knex => {
  await knex('scopes')
    .insert([
      { name: 'all' },
      { name: 'own' }
    ])
}
