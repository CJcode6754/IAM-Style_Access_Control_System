import bcrypt from "bcryptjs";

export const seedData = async () => {
  const adminPassword = await bcrypt.hash('admin123', 10);

  return {
    users: [
      {
        username: 'admin',
        email: 'admin@system.com',
        password: adminPassword,
      }
    ],
    groups: [
      {
        name: 'Administrators',
        description: 'System administrators with full access'
      }
    ],
    roles: [
      {
        name: 'Super Admin',
        description: 'Role with all system permissions'
      }
    ],
    modules: [
      { name: 'Users', description: 'User management module' },
      { name: 'Groups', description: 'Group management module' },
      { name: 'Roles', description: 'Role management module' },
      { name: 'Modules', description: 'Module management' },
      { name: 'Permissions', description: 'Permission management module' }
    ],
    permissions: [
      // Users permissions
      { module_name: 'Users', action: 'create' },
      { module_name: 'Users', action: 'read' },
      { module_name: 'Users', action: 'update' },
      { module_name: 'Users', action: 'delete' },
      // Groups permissions
      { module_name: 'Groups', action: 'create' },
      { module_name: 'Groups', action: 'read' },
      { module_name: 'Groups', action: 'update' },
      { module_name: 'Groups', action: 'delete' },
      // Roles permissions
      { module_name: 'Roles', action: 'create' },
      { module_name: 'Roles', action: 'read' },
      { module_name: 'Roles', action: 'update' },
      { module_name: 'Roles', action: 'delete' },
      // Modules permissions
      { module_name: 'Modules', action: 'create' },
      { module_name: 'Modules', action: 'read' },
      { module_name: 'Modules', action: 'update' },
      { module_name: 'Modules', action: 'delete' },
      // Permissions permissions
      { module_name: 'Permissions', action: 'create' },
      { module_name: 'Permissions', action: 'read' },
      { module_name: 'Permissions', action: 'update' },
      { module_name: 'Permissions', action: 'delete' }
    ],
    // Initial assignments
    userGroups: [
      { user_id: 1, group_id: 1 } // Assign admin to Administrators group
    ],
    groupRoles: [
      { group_id: 1, role_id: 1 } // Assign Super Admin role to Administrators group
    ],
    rolePermissions: [
      // Assign all permissions to Super Admin role
      { role_id: 1, permission_id: 1 },
      { role_id: 1, permission_id: 2 },
      { role_id: 1, permission_id: 3 },
      { role_id: 1, permission_id: 4 },
      { role_id: 1, permission_id: 5 },
      { role_id: 1, permission_id: 6 },
      { role_id: 1, permission_id: 7 },
      { role_id: 1, permission_id: 8 },
      { role_id: 1, permission_id: 9 },
      { role_id: 1, permission_id: 10 },
      { role_id: 1, permission_id: 11 },
      { role_id: 1, permission_id: 12 },
      { role_id: 1, permission_id: 13 },
      { role_id: 1, permission_id: 14 },
      { role_id: 1, permission_id: 15 },
      { role_id: 1, permission_id: 16 },
      { role_id: 1, permission_id: 17 },
      { role_id: 1, permission_id: 18 },
      { role_id: 1, permission_id: 19 },
      { role_id: 1, permission_id: 20 }
    ]
  };
};
