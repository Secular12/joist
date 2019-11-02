exports.up = async knex => {
  await knex.schema.createTable('roles_permissions', table => {
    table.string('action').notNullable()
    table.string('module').notNullable()
    table.integer('role_id').unsigned().notNullable()
    table.string('scope').notNullable()
    table.timestamps(false, true)
    table.datetime('deleted_at')
    table.primary(['role_id', 'action', 'scope', 'module'])
    table
      .foreign(['action', 'scope', 'module'])
      .references(['action', 'scope', 'module'])
      .inTable('permissions')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('roles_permissions')
}
