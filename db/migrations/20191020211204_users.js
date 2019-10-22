exports.up = async knex => {
  await knex.schema.createTable('users', table => {
    table.increments()
    table.string('email').notNullable()
    table.string('first_name').notNullable()
    table.string('last_name').notNullable()
    table.string('password').notNullable()
    table.string('username').notNullable()
    table.timestamps(false, true)
    table.datetime('deleted_at')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('users')
}
