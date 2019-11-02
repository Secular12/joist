exports.seed = async knex => {
  await require('./seeders/RolesSeeder')(knex)
  await require('./seeders/RolesPermissionsSeeder')(knex)
  await require('./seeders/UsersSeeder')(knex)
}
