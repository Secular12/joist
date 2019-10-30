exports.up = async knex => {
  await knex.schema.createTable('scopes', table => {
    table.increments()
    table.string('name').notNullable()
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('scopes')
}
