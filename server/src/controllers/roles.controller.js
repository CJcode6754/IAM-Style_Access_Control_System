import database from "../config/database.js";

const db = database.getDB();

export const indexRoles = (req, res, next) => {
  try {
    const query = `
  SELECT r.id, r.name, r.description, r.created_at, r.updated_at,
         COUNT(DISTINCT gr.group_id) as group_count,
         COUNT(DISTINCT rp.permission_id) as permission_count
  FROM roles r
  LEFT JOIN group_roles gr ON r.id = gr.role_id
  LEFT JOIN role_permissions rp ON r.id = rp.role_id
  GROUP BY r.id, r.name, r.description, r.created_at, r.updated_at
  ORDER BY r.name
`;

db.all(query, [], (err, roles) => {
  if (err) {
    return next(err);
  }

  res.json({ roles });
});

  } catch (error) {
    next(error);
  }
};

export const showRole = (req, res, next) => {
  try {
    const { id } = req.params;

    const roleQuery = `SELECT id, name, description, created_at, updated_at FROM roles WHERE id = ?`;

    db.get(roleQuery, [id], (err, role) => {
      if (err) {
        return next(err);
      }

      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      // Get role's permissions
      const permissionsQuery = `
        SELECT p.id, p.name, p.action, m.name as module_name, m.id as module_id
        FROM permissions p
        JOIN modules m ON p.module_id = m.id
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
        ORDER BY m.name, p.action
      `;

      db.all(permissionsQuery, [id], (err, permissions) => {
        if (err) {
          return next(err);
        }

        // Get groups that have this role
        const groupsQuery = `
          SELECT g.id, g.name, g.description
          FROM groups g
          JOIN group_roles gr ON g.id = gr.group_id
          WHERE gr.role_id = ?
        `;

        db.all(groupsQuery, [id], (err, groups) => {
          if (err) {
            return next(err);
          }

          res.json({ role: { ...role, permissions, groups } });
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const createRole = (req, res, next) => {
  try {
    const { name, description } = req.body;

    const stmt = db.prepare(
      `INSERT INTO roles (name, description) VALUES (?, ?)`
    );

    stmt.run([name, description || null], function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
          return res.status(409).json({ message: "Role name already exists" });
        }
        return next(err);
      }

      res.status(201).json({
        message: "Role created successfully",
        role: { id: this.lastID, name, description },
      });
    });

    stmt.finalize();
  } catch (error) {
    next(error);
  }
};

export const updateRole = (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if role exists
    db.get(`SELECT id FROM roles WHERE id = ?`, [id], (err, role) => {
      if (err) {
        return next(err);
      }

      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      db.run(
        `UPDATE roles SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [name, description || null, id],
        function (err) {
          if (err) {
            if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
              return res
                .status(409)
                .json({ message: "Role name already exists" });
            }
            return next(err);
          }

          res.json({ message: "Role updated successfully" });
        }
      );
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRole = (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if role exists
    db.get(`SELECT id FROM roles WHERE id = ?`, [id], (err, role) => {
      if (err) {
        return next(err);
      }

      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      db.run(`DELETE FROM roles WHERE id = ?`, [id], function (err) {
        if (err) {
          return next(err);
        }

        res.json({ message: "Role deleted successfully" });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const assignPermissionsToRole = (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;

    if (
      !permissionIds ||
      !Array.isArray(permissionIds) ||
      permissionIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Permission IDs array is required" });
    }

    // Check if role exists
    db.get(`SELECT id FROM roles WHERE id = ?`, [id], (err, role) => {
      if (err) {
        return next(err);
      }

      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      let completed = 0;
      let errors = [];

      const stmt = db.prepare(
        `INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`
      );

      permissionIds.forEach((permissionId) => {
        stmt.run([id, permissionId], function (err) {
          completed++;
          if (err) {
            errors.push(
              `Error assigning permission ${permissionId}: ${err.message}`
            );
          }

          if (completed === permissionIds.length) {
            stmt.finalize();

            if (errors.length > 0) {
              return res.status(400).json({
                message: "Some permission assignments failed",
                errors,
              });
            }

            res.json({ message: "Permissions assigned to role successfully" });
          }
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const removePermissionFromRole = (req, res, next) => {
  try {
    const { id, permissionId } = req.params;

    db.run(
      `DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?`,
      [id, permissionId],
      function (err) {
        if (err) {
          return next(err);
        }

        if (this.changes === 0) {
          return res
            .status(404)
            .json({ message: "Permission not found in role" });
        }

        res.json({ message: "Permission removed from role successfully" });
      }
    );
  } catch (error) {
    next(error);
  }
};
