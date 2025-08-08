import Database from "../config/database.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const db = Database.getDB();

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const stmt = db.prepare(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
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

      const token = jwt.sign(
        { id: this.lastID, username, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || "1h" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: { id: this.lastID, username, email },
      });
    });

    stmt.finalize();
  } catch (error) {
    next(error);
  }
};

export const login = (req, res, next) => {
  try {
    const { email, password } = req.body;

    db.get(
      `SELECT id, username, email, password FROM users WHERE email = ?`,
      [email],
      async (err, user) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
        );

        res.json({
          message: "Login successful",
          token,
          user: { id: user.id, username: user.username, email: user.email },
        });
      }
    );
  } catch (error) {
    next(error);
  }
};

export const permissions = (req, res, next) => {
  try {
    const userId = req.user.id;

    const query = `SELECT DISTINCT p.id, p.name, p.action, m.name as module_name, m.id as module_id
      FROM permissions p
      JOIN modules m ON p.module_id = m.id
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN roles r ON rp.role_id = r.id
      JOIN group_roles gr ON r.id = gr.role_id
      JOIN groups g ON gr.group_id = g.id
      JOIN user_groups ug ON g.id = ug.group_id
      WHERE ug.user_id = ?
      ORDER BY m.name, p.action`;

    db.all(query, [userId], (err, permissions) => {
      if (err) {
        return next(err);
      }

      res.json({ permissions });
    });
  } catch (error) {
    next(error);
  }
};

export const simulateAction = (req, res, next) => {
  try {
    const { moduleName, action, userId } = req.body;
    const targetUserId = userId || req.user.id;

    if (!moduleName || !action) {
      return res
        .status(400)
        .json({ message: "Module name and action are required" });
    }

    const query = `
      SELECT COUNT(*) as count
      FROM permissions p
      JOIN modules m ON p.module_id = m.id
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN roles r ON rp.role_id = r.id
      JOIN group_roles gr ON r.id = gr.role_id
      JOIN groups g ON gr.group_id = g.id
      JOIN user_groups ug ON g.id = ug.group_id
      WHERE ug.user_id = ? AND m.name = ? AND p.action = ?
    `;

    db.get(query, [targetUserId, moduleName, action], (err, result) => {
      if (err) {
        return next(err);
      }

      const hasPermission = result.count > 0;

      res.json({
        hasPermission,
        message: hasPermission
          ? `User has permission to ${action} on ${moduleName}`
          : `User does not have permission to ${action} on ${moduleName}`,
      });
    });
  } catch (error) {
    next(error);
  }
};
