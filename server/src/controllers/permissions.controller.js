import Database from "../config/database.js";

const db = Database.getDB();

export const indexPermissions = (req, res, next) => {
  try {
    const query = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.action,
        p.created_at,
        m.id as module_id,
        m.name as module_name,
        m.description as module_description,
        (
          SELECT COUNT(DISTINCT rp2.role_id)
          FROM role_permissions rp2
          WHERE rp2.permission_id = p.id
        ) as role_count
      FROM permissions p
      JOIN modules m ON p.module_id = m.id
      ORDER BY m.name, p.action
    `;

    db.all(query, [], (err, permissions) => {
      if (err) {
        return next(err);
      }

      res.json({ permissions });
    });
  } catch (error) {
    next(error);
  }
};

export const showPermission = (req, res, next) => {
  try {
    const { id } = req.params;

    const permissionQuery = `
      SELECT p.id, p.name, p.action, p.created_at,
             m.id as module_id, m.name as module_name
      FROM permissions p
      JOIN modules m ON p.module_id = m.id
      WHERE p.id = ?
    `;

    db.get(permissionQuery, [id], (err, permission) => {
      if (err) {
        return next(err);
      }

      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }

      // Get roles that have this permission
      const rolesQuery = `
        SELECT r.id, r.name, r.description
        FROM roles r
        JOIN role_permissions rp ON r.id = rp.role_id
        WHERE rp.permission_id = ?
      `;

      db.all(rolesQuery, [id], (err, roles) => {
        if (err) {
          return next(err);
        }

        res.json({ permission: { ...permission, roles } });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const createPermission = (req, res, next) => {
  try {
    const { name, action, module_id } = req.body;

    // Check if module exists
    db.get(
      `SELECT id FROM modules WHERE id = ?`,
      [module_id],
      (err, module) => {
        if (err) {
          return next(err);
        }

        if (!module) {
          return res.status(404).json({ message: "Module not found" });
        }

        const stmt = db.prepare(
          `INSERT INTO permissions (name, action, module_id) VALUES (?, ?, ?)`
        );

        stmt.run([name, action, module_id], function (err) {
          if (err) {
            if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
              return res
                .status(409)
                .json({
                  message:
                    "Permission already exists for this module and action",
                });
            }
            return next(err);
          }

          res.status(201).json({
            message: "Permission created successfully",
            permission: { id: this.lastID, name, action, module_id },
          });
        });

        stmt.finalize();
      }
    );
  } catch (error) {
    next(error);
  }
};

export const updatePermission = (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, action, module_id } = req.body;

    // Check if permission exists
    db.get(
      `SELECT id FROM permissions WHERE id = ?`,
      [id],
      (err, permission) => {
        if (err) {
          return next(err);
        }

        if (!permission) {
          return res.status(404).json({ message: "Permission not found" });
        }

        // Check if module exists
        db.get(
          `SELECT id FROM modules WHERE id = ?`,
          [module_id],
          (err, module) => {
            if (err) {
              return next(err);
            }

            if (!module) {
              return res.status(404).json({ message: "Module not found" });
            }

            db.run(
              `UPDATE permissions SET name = ?, action = ?, module_id = ? WHERE id = ?`,
              [name, action, module_id, id],
              function (err) {
                if (err) {
                  if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
                    return res
                      .status(409)
                      .json({
                        message:
                          "Permission already exists for this module and action",
                      });
                  }
                  return next(err);
                }

                res.json({ message: "Permission updated successfully" });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
};

export const deletePermission = (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if permission exists
    db.get(
      `SELECT id FROM permissions WHERE id = ?`,
      [id],
      (err, permission) => {
        if (err) {
          return next(err);
        }

        if (!permission) {
          return res.status(404).json({ message: "Permission not found" });
        }

        // Check if permission is assigned to any roles
        db.get(
          `SELECT COUNT(*) as count FROM role_permissions WHERE permission_id = ?`,
          [id],
          (err, result) => {
            if (err) {
              return next(err);
            }

            if (result.count > 0) {
              return res.status(400).json({
                message:
                  "Cannot delete permission assigned to roles. Remove from roles first.",
              });
            }

            db.run(
              `DELETE FROM permissions WHERE id = ?`,
              [id],
              function (err) {
                if (err) {
                  return next(err);
                }

                res.json({ message: "Permission deleted successfully" });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
};
