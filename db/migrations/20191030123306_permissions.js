exports.up = async knex => {
  await knex.schema.createTable('permissions', table => {
    table.string('action').notNullable()
    table
      .string('scope')
      .notNullable()
      .references('name')
      .inTable('scopes')
    table
      .string('module')
      .notNullable()
      .references('name')
      .inTable('modules')
    table.primary(['action', 'scope', 'module'])
    table.string('name').notNullable()
    table.timestamps(false, true)
    table.datetime('deleted_at')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('permissions')
}
