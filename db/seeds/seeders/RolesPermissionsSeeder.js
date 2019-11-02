module.exports = async knex => {
  await knex('roles_permissions')
    .insert([
      {
        action: 'create',
        module: 'permissions',
        role_id: 1,
        scope: 'all'
      },
      {
        action: 'delete',
        module: 'permissions',
        role_id: 1,
        scope: 'all'
      },
      {
        action: 'read',
        module: 'permissions',
        role_id: 1,
        scope: 'all'
      },
      {
        action: 'read',
        module: 'permissions',
        role_id: 2,
        scope: 'own'
      },
      {
        action: 'update',
        module: 'permissions',
        role_id: 1,
        scope: 'all'
      },
      {
        action: 'create',
        module: 'roles',
        role_id: 1,
        scope: 'all'
      },
      {
        action: 'delete',
        module: 'roles',
        role_id: 1,
        scope: 'all'
      },
      {
        action: 'read',
        module: 'roles',
        role_id: 1,
        scope: 'all'
      },
      {
        action: 'read',
        module: 'roles',
        role_id: 2,
        scope: 'own'
      },
      {
        action: 'update',
        module: 'roles',
        role_id: 1,
        scope: 'all'
      },
      {
        action: 'read',
        module: 'users',
        role_id: 1,
        scope: 'all'
      },
      {
        action: 'read',
        module: 'users',
        role_id: 2,
        scope: 'own'
      }
    ])
}
