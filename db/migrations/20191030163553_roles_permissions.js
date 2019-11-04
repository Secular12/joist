exports.up = async knex => {
  await knex.schema.createTable('roles_permissions', table => {
    table.integer('role_id').unsigned().notNullable()
    table.string('action').notNullable()
    table.string('scope').notNullable()
    table.string('module').notNullable()
    table.primary(['role_id', 'action', 'scope', 'module'])
    table
      .foreign(['action', 'scope', 'module'])
      .references(['action', 'scope', 'module'])
      .inTable('permissions')
    table.timestamps(false, true)
    table.datetime('deleted_at')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('roles_permissions')
}
