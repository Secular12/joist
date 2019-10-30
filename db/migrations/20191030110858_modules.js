exports.up = async knex => {
  await knex.schema.createTable('modules', table => {
    table.string('name').notNullable().primary()
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('modules')
}
