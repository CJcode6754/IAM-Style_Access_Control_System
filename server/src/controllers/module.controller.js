import Database from "../config/database.js";

const db = Database.getDB();

export const indexModules = (req, res, next) => {
  try {
    const query = `
      SELECT m.id, m.name, m.description, m.created_at, m.updated_at,
             COUNT(p.id) as permission_count
      FROM modules m
      LEFT JOIN permissions p ON m.id = p.module_id
      GROUP BY m.id, m.name, m.description, m.created_at, m.updated_at
      ORDER BY m.name
    `;

    db.all(query, [], (err, modules) => {
      if (err) {
        return next(err);
      }

      res.json({ modules });
    });
  } catch (error) {
    next(error);
  }
};

export const showModule = (req, res, next) => {
  try {
    const { id } = req.params;

    const moduleQuery = `SELECT id, name, description, created_at, updated_at FROM modules WHERE id = ?`;

    db.get(moduleQuery, [id], (err, module) => {
      if (err) {
        return next(err);
      }

      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      // Get module's permissions
      const permissionsQuery = `
        SELECT id, name, action, created_at
        FROM permissions
        WHERE module_id = ?
        ORDER BY action
      `;

      db.all(permissionsQuery, [id], (err, permissions) => {
        if (err) {
          return next(err);
        }

        res.json({ module: { ...module, permissions } });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const createModule = (req, res, next) => {
  try {
    const { name, description } = req.body;

    const stmt = db.prepare(
      `INSERT INTO modules (name, description) VALUES (?, ?)`
    );

    stmt.run([name, description || null], function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
          return res
            .status(409)
            .json({ message: "Module name already exists" });
        }
        return next(err);
      }

      const moduleId = this.lastID;

      // Auto-create basic permissions for the module
      const actions = ["create", "read", "update", "delete"];
      const permStmt = db.prepare(
        `INSERT INTO permissions (name, action, module_id) VALUES (?, ?, ?)`
      );

      let completed = 0;
      actions.forEach((action) => {
        const permissionName = `${action}_${name
          .toLowerCase()
          .replace(/\s+/g, "_")}`;
        permStmt.run([permissionName, action, moduleId], function (err) {
          completed++;
          if (completed === actions.length) {
            permStmt.finalize();
          }
        });
      });

      res.status(201).json({
        message: "Module created successfully with basic permissions",
        module: { id: moduleId, name, description },
      });
    });

    stmt.finalize();
  } catch (error) {
    next(error);
  }
};

export const updateModule = (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if module exists
    db.get(`SELECT id FROM modules WHERE id = ?`, [id], (err, module) => {
      if (err) {
        return next(err);
      }

      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      db.run(
        `UPDATE modules SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [name, description || null, id],
        function (err) {
          if (err) {
            if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
              return res
                .status(409)
                .json({ message: "Module name already exists" });
            }
            return next(err);
          }

          res.json({ message: "Module updated successfully" });
        }
      );
    });
  } catch (error) {
    next(error);
  }
};

export const deleteModule = (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if module exists
    db.get(`SELECT id FROM modules WHERE id = ?`, [id], (err, module) => {
      if (err) {
        return next(err);
      }

      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      // Check if module has any permissions assigned to roles
      const checkQuery = `
        SELECT COUNT(*) as count
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE p.module_id = ?
      `;

      db.get(checkQuery, [id], (err, result) => {
        if (err) {
          return next(err);
        }

        if (result.count > 0) {
          return res.status(400).json({
            message:
              "Cannot delete module with permissions assigned to roles. Remove permissions from roles first.",
          });
        }

        db.run(`DELETE FROM modules WHERE id = ?`, [id], function (err) {
          if (err) {
            return next(err);
          }

          res.json({ message: "Module deleted successfully" });
        });
      });
    });
  } catch (error) {
    next(error);
  }
};
