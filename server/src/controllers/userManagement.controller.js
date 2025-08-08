import Database from "../config/database.js";
import bcrypt from "bcryptjs";

const db = Database.getDB();

export const indexUser = (req, res, next) => {
  try {
    const query = `
        SELECT u.id, u.username, u.email, u.created_at, u.updated_at,
             GROUP_CONCAT(g.name) as groups
      FROM users u
      LEFT JOIN user_groups ug ON u.id = ug.user_id
      LEFT JOIN groups g ON ug.group_id = g.id
      GROUP BY u.id, u.username, u.email, u.created_at, u.updated_at
      ORDER BY u.username
        `;

    db.all(query, [], (err, users) => {
      if (err) {
        return next(err);
      }

      const processedUsers = users.map((user) => ({
        ...user,
        groups: user.groups ? user.groups.split(",") : [],
      }));

      res.json({
        users: processedUsers,
      });
    });
  } catch (error) {
    next(error);
  }
};

export const showUser = (req, res, next) => {
  try {
    const { id } = req.params;

    const userQuery = `SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?`;

    db.get(userQuery, [id], (err, user) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's groups
      const groupsQuery = `
        SELECT g.id, g.name, g.description
        FROM groups g
        JOIN user_groups ug ON g.id = ug.group_id
        WHERE ug.user_id = ?
      `;

      db.all(groupsQuery, [id], (err, groups) => {
        if (err) {
          return next(err);
        }

        res.json({ user: { ...user, groups } });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const stmt = db.prepare(
      `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`
    );

    stmt.run([username, email, hashedPassword], function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
          return res
            .status(409)
            .json({ message: "Username or email already exists" });
        }
        return next(err);
      }

      res.status(201).json({
        message: "User created successfully",
        user: { id: this.lastID, username, email },
      });
    });

    stmt.finalize();
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    db.get(`SELECT * FROM users WHERE id = ?`, [id], async (err, user) => {
      if (err) return next(err);
      if (!user) return res.status(404).json({ message: "User not found" });

      const newUsername = username ?? user.username;
      const newEmail = email ?? user.email;

      let updateQuery = `UPDATE users SET username = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      let params = [newUsername, newEmail, id];

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        updateQuery = `UPDATE users SET username = ?, email = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        params = [newUsername, newEmail, hashedPassword, id];
      }

      db.run(updateQuery, params, function (err) {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res
              .status(409)
              .json({ message: "Username or email already exists" });
          }
          return next(err);
        }
        res.json({ message: "User updated successfully" });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = (req, res, next) => {
  const { id } = req.params;

  // Check if user exists
  db.get(`SELECT id FROM users WHERE id = ?`, [id], (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete user (cascading will handle related user_groups, etc.)
    db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
      if (err) return next(err);
      res.json({ message: "User deleted successfully" });
    });
  });
};
