exports.up = async knex => {
  await knex.schema.createTable('roles_permissions', table => {
    table.string('action').notNullable()
    table
      .string('module')
      .notNullable()
      .references('name')
      .inTable('modules')
    table.string('name').notNullable()
    table
      .integer('role_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('roles')
    table
      .string('scope')
      .notNullable()
      .references('name')
      .inTable('scopes')
    table.timestamps(false, true)
    table.datetime('deleted_at')
    table.primary(['role_id', 'action', 'scope', 'module'])
    table
      .foreign(['action', 'scope', 'module'])
      .references(['action', 'scope', 'module'])
      .onTable('permissions')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('roles_permissions')
}
