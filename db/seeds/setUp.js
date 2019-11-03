exports.seed = async knex => {
  await require('./seeders/ModulesSeeder')(knex)
  await require('./seeders/ScopesSeeder')(knex)
  await require('./seeders/PermissionsSeeder')(knex)
  await require('./seeders/RolesSeeder')(knex)
  await require('./seeders/RolesPermissionsSeeder')(knex)
}
