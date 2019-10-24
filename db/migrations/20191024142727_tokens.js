exports.up = async knex => {
  await knex.schema.createTable('tokens', table => {
    table.increments()
    table
      .string('token')
      .notNullable()
      .unique()
      .index()
    table.string('type').notNullable()
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