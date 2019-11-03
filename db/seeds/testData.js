exports.seed = async knex => {
  await require('./seeders/UsersSeeder')(knex)
  await require('./seeders/UsersRolesSeeder')(knex)
}
