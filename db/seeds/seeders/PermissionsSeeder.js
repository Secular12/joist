module.exports = async knex => {
  await knex('permissions')
    .insert([
      {
        action: 'create',
        module: 'permissions',
        name: 'create a new module, permission, or scope',
        scope: 'all'
      },
      {
        action: 'delete',
        module: 'permissions',
        name: 'delete a module, permission, or scope',
        scope: 'all'
      },
      {
        action: 'read',
        module: 'permissions',
        name: 'read any module, permission, or scope',
        scope: 'all'
      },
      {
        action: 'read',
        module: 'permissions',
        name: 'read permissions belonging to the user',
        scope: 'own'
      },
      {
        action: 'update',
        module: 'permissions',
        name: 'update a module, permission, or scope',
        scope: 'all'
      },
      {
        action: 'create',
        module: 'roles',
        name: 'create a new role',
        scope: 'all'
      },
      {
        action: 'delete',
        module: 'roles',
        name: 'delete a role',
        scope: 'all'
      },
      {
        action: 'read',
        module: 'roles',
        name: 'read any role',
        scope: 'all'
      },
      {
        action: 'read',
        module: 'roles',
        name: 'read role(s) belonging to the user',
        scope: 'own'
      },
      {
        action: 'update',
        module: 'roles',
        name: 'update a role',
        scope: 'all'
      },
      {
        action: 'read',
        module: 'users',
        name: 'read any user',
        scope: 'all'
      },
      {
        action: 'read',
        module: 'users',
        name: 'read own user data',
        scope: 'own'
      }
    ])
}
