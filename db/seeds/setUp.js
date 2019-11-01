exports.seed = async knex => {
  await require('./seeders/ModulesSeeder')(knex)
  await require('./seeders/ScopesSeeder')(knex)
}
