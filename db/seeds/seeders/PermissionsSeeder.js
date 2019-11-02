module.exports = async knex => {
  await knex('permissions')
    .insert([
      {
        action: 'create',
        module: 'permissions',
        name: 'create new modules, permissions, or scopes',
        scope: 'all'
      },
      {
        action: 'delete',
        module: 'permissions',
        name: 'delete any module, permission, or scope',
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
        name: 'update any module, permission, or scope',
        scope: 'all'
      },
      {
        action: 'create',
        module: 'roles',
        name: 'create new roles',
        scope: 'all'
      },
      {
        action: 'delete',
        module: 'roles',
        name: 'delete any role',
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
        name: 'update any role',
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
