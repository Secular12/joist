exports.seed = async knex => {
  await require('./seeders/ModulesSeeder')(knex)
}
