exports.up = async knex => {
  await knex.schema.createTable('roles', table => {
    table.increments()
    table.string('name').notNullable()
    table.timestamps(false, true)
    table.datetime('deleted_at')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('roles')
}
