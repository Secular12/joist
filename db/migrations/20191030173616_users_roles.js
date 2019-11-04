exports.up = async knex => {
  await knex.schema.createTable('users_roles', table => {
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
    table
      .integer('role_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('roles')
    table.primary(['user_id', 'role_id'])
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('users_roles')
}
