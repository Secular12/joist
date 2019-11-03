exports.up = async knex => {
  await knex.schema.createTable('scopes', table => {
    table.string('name').notNullable().primary()
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('scopes')
}
