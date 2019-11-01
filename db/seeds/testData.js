exports.seed = async knex => {
  await require('./seeders/UsersSeeder')(knex)
}
