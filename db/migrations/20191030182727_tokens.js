exports.up = async knex => {
  await knex.schema.createTable('tokens', table => {
    table
      .string('token')
      .notNullable()
      .primary()
    table.datetime('expires_at')
    table.string('ip')
    table.string('type').notNullable()
    table.string('user_agent')
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
    table.timestamps(false, true)
    table.datetime('deleted_at')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('tokens')
}
