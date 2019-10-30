exports.up = async knex => {
  await knex.schema.createTable('modules', table => {
    table.increments()
    table.string('name').notNullable()
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('modules')
}
