import Database from "../config/database.js";

const db = Database.getDB();

export const indexGroup = (req, res, next) => {
  try {
    const query = `
      SELECT 
        g.id, 
        g.name, 
        g.description, 
        g.created_at, 
        g.updated_at,
        COALESCE(
          (
            SELECT JSON_GROUP_ARRAY(
              JSON_OBJECT(
                'id', u.id,
                'username', u.username,
                'email', u.email
              )
            )
            FROM users u
            JOIN user_groups ug ON u.id = ug.user_id
            WHERE ug.group_id = g.id
          ),
          JSON_ARRAY()
        ) as users,
        COALESCE(
          (
            SELECT JSON_GROUP_ARRAY(
              JSON_OBJECT(
                'id', r.id,
                'name', r.name,
                'description', r.description
              )
            )
            FROM roles r
            JOIN group_roles gr ON r.id = gr.role_id
            WHERE gr.group_id = g.id
          ),
          JSON_ARRAY()
        ) as roles
      FROM groups g
      ORDER BY g.name
    `;

    db.all(query, [], (err, groups) => {
      if (err) {
        return next(err);
      }

      // Parse JSON strings and ensure proper array structure
      const processedGroups = groups.map(group => ({
        ...group,
        users: group.users ? JSON.parse(group.users) : [],
        roles: group.roles ? JSON.parse(group.roles) : []
      }));

      res.json({ groups: processedGroups });
    });
  } catch (error) {
    next(error);
  }
};

export const showGroup = (req, res, next) => {
  try {
    const { id } = req.params;

    const groupQuery = `SELECT id, name, description, created_at, updated_at FROM groups WHERE id = ?`;

    db.get(groupQuery, [id], (err, group) => {
      if (err) {
        return next(err);
      }

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      // Get group's users
      const usersQuery = `
        SELECT u.id, u.username, u.email
        FROM users u
        JOIN user_groups ug ON u.id = ug.user_id
        WHERE ug.group_id = ?
      `;

      db.all(usersQuery, [id], (err, users) => {
        if (err) {
          return next(err);
        }

        // Get group's roles
        const rolesQuery = `
          SELECT r.id, r.name, r.description
          FROM roles r
          JOIN group_roles gr ON r.id = gr.role_id
          WHERE gr.group_id = ?
        `;

        db.all(rolesQuery, [id], (err, roles) => {
          if (err) {
            return next(err);
          }

          res.json({ group: { ...group, users: users || [], roles: roles || [] } });
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const createGroup = (req, res, next) => {
  try {
    const { name, description } = req.body;

    const stmt = db.prepare(
      `INSERT INTO groups (name, description) VALUES (?, ?)`
    );

    stmt.run([name, description || null], function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
          return res.status(409).json({ message: "Group name already exists" });
        }
        return next(err);
      }

      res.status(201).json({
        message: "Group created successfully",
        group: { 
          id: this.lastID, 
          name, 
          description,
          users: [],
          roles: []
        },
      });
    });

    stmt.finalize();
  } catch (error) {
    next(error);
  }
};

export const updateGroup = (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if group exists
    db.get(`SELECT id FROM groups WHERE id = ?`, [id], (err, group) => {
      if (err) {
        return next(err);
      }

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      db.run(
        `UPDATE groups SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [name, description || null, id],
        function (err) {
          if (err) {
            if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
              return res
                .status(409)
                .json({ message: "Group name already exists" });
            }
            return next(err);
          }

          // Return updated group with users and roles
          const updatedGroupQuery = `
            SELECT 
              g.id, 
              g.name, 
              g.description, 
              g.created_at, 
              g.updated_at,
              COALESCE(
                (
                  SELECT JSON_GROUP_ARRAY(
                    JSON_OBJECT(
                      'id', u.id,
                      'username', u.username,
                      'email', u.email
                    )
                  )
                  FROM users u
                  JOIN user_groups ug ON u.id = ug.user_id
                  WHERE ug.group_id = g.id
                ),
                JSON_ARRAY()
              ) as users
            FROM groups g
            WHERE g.id = ?
          `;

          db.get(updatedGroupQuery, [id], (err, updatedGroup) => {
            if (err) {
              return next(err);
            }

            const processedGroup = {
              ...updatedGroup,
              users: updatedGroup.users ? JSON.parse(updatedGroup.users) : []
            };

            res.json({ 
              message: "Group updated successfully",
              group: processedGroup
            });
          });
        }
      );
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if group exists
    db.get(`SELECT id FROM groups WHERE id = ?`, [id], (err, group) => {
      if (err) {
        return next(err);
      }

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      db.run(`DELETE FROM groups WHERE id = ?`, [id], function (err) {
        if (err) {
          return next(err);
        }

        res.json({ message: "Group deleted successfully" });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const assignedUserToGroup = (req, res, next) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "User IDs array is required" });
    }

    // Check if group exists
    db.get(`SELECT id, name FROM groups WHERE id = ?`, [id], (err, group) => {
      if (err) {
        return next(err);
      }

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      // Verify all users exist
      const placeholders = userIds.map(() => '?').join(',');
      const userCheckQuery = `SELECT id FROM users WHERE id IN (${placeholders})`;
      
      db.all(userCheckQuery, userIds, (err, existingUsers) => {
        if (err) {
          return next(err);
        }

        if (existingUsers.length !== userIds.length) {
          return res.status(400).json({ message: "Some users do not exist" });
        }

        // Begin transaction-like operations
        let completed = 0;
        let errors = [];
        let successCount = 0;

        const stmt = db.prepare(
          `INSERT OR IGNORE INTO user_groups (user_id, group_id) VALUES (?, ?)`
        );

        userIds.forEach((userId) => {
          stmt.run([userId, id], function (err) {
            completed++;
            if (err) {
              errors.push(`Error assigning user ${userId}: ${err.message}`);
            } else if (this.changes > 0) {
              successCount++;
            }

            if (completed === userIds.length) {
              stmt.finalize();

              if (errors.length > 0) {
                return res.status(400).json({
                  message: "Some assignments failed",
                  errors,
                });
              }

              // Return updated group with users
              const updatedGroupQuery = `
                SELECT 
                  g.id, 
                  g.name, 
                  g.description, 
                  g.created_at, 
                  g.updated_at,
                  COALESCE(
                    (
                      SELECT JSON_GROUP_ARRAY(
                        JSON_OBJECT(
                          'id', u.id,
                          'username', u.username,
                          'email', u.email
                        )
                      )
                      FROM users u
                      JOIN user_groups ug ON u.id = ug.user_id
                      WHERE ug.group_id = g.id
                    ),
                    JSON_ARRAY()
                  ) as users
                FROM groups g
                WHERE g.id = ?
              `;

              db.get(updatedGroupQuery, [id], (err, updatedGroup) => {
                if (err) {
                  return next(err);
                }

                const processedGroup = {
                  ...updatedGroup,
                  users: updatedGroup.users ? JSON.parse(updatedGroup.users) : []
                };

                res.json({ 
                  message: `${successCount} users assigned to group successfully`,
                  group: processedGroup
                });
              });
            }
          });
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const removeUserFromGroup = (req, res, next) => {
  try {
    const { id, userId } = req.params;

    db.run(
      `DELETE FROM user_groups WHERE group_id = ? AND user_id = ?`,
      [id, userId],
      function (err) {
        if (err) {
          return next(err);
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: "User not found in group" });
        }

        res.json({ message: "User removed from group successfully" });
      }
    );
  } catch (error) {
    next(error);
  }
};

export const assignRolesToGroup = (req, res, next) => {
  try {
    const { id } = req.params;
    const { roleIds } = req.body;

    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return res.status(400).json({ message: "Role IDs array is required" });
    }

    // Check if group exists
    db.get(`SELECT id FROM groups WHERE id = ?`, [id], (err, group) => {
      if (err) {
        return next(err);
      }

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      let completed = 0;
      let errors = [];

      const stmt = db.prepare(
        `INSERT OR IGNORE INTO group_roles (group_id, role_id) VALUES (?, ?)`
      );

      roleIds.forEach((roleId) => {
        stmt.run([id, roleId], function (err) {
          completed++;
          if (err) {
            errors.push(`Error assigning role ${roleId}: ${err.message}`);
          }

          if (completed === roleIds.length) {
            stmt.finalize();

            if (errors.length > 0) {
              return res.status(400).json({
                message: "Some role assignments failed",
                errors,
              });
            }

            res.json({ message: "Roles assigned to group successfully" });
          }
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const removeRoleFromGroup = (req, res, next) => {
  try {
    const { id, roleId } = req.params;

    db.run(
      `DELETE FROM group_roles WHERE group_id = ? AND role_id = ?`,
      [id, roleId],
      function (err) {
        if (err) {
          return next(err);
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: "Role not found in group" });
        }

        res.json({ message: "Role removed from group successfully" });
      }
    );
  } catch (error) {
    next(error);
  }
};