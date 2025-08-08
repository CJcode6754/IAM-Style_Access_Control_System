import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";

class Database {
  constructor() {
    // Change ":memory:" to "./database.sqlite" for persistence
    this.db = new sqlite3.Database(":memory:", (err) => {
      if (err) {
        console.error("Database connection error:", err.message);
      } else {
        console.log("Database is ready");
      }
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async initialize() {
    try {
      await this.createTables();
      await this.insertSeedData();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }

  async createTables() {
    const createStatements = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        action TEXT NOT NULL,
        module_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
        UNIQUE (action, module_id)
      )`,
      `CREATE TABLE IF NOT EXISTS user_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        group_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        UNIQUE (user_id, group_id)
      )`,
      `CREATE TABLE IF NOT EXISTS group_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE (group_id, role_id)
      )`,
      `CREATE TABLE IF NOT EXISTS role_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
        UNIQUE (role_id, permission_id)
      )`
    ];

    for (const statement of createStatements) {
      await this.run(statement);
    }
  }

  async insertSeedData() {
    // Create group & role
    await this.run(
      "INSERT OR IGNORE INTO groups (name, description) VALUES (?, ?)",
      ["Administrators", "System administrators with full access"]
    );

    await this.run(
      "INSERT OR IGNORE INTO roles (name, description) VALUES (?, ?)",
      ["Admin", "Full system access"]
    );

    // Insert modules
    const modulesData = [
      ["Users", "User management module"],
      ["Groups", "Group management module"],
      ["Roles", "Role management module"],
      ["Modules", "Module management module"],
      ["Permissions", "Permission management module"],
    ];

    for (const [name, description] of modulesData) {
      await this.run(
        "INSERT OR IGNORE INTO modules (name, description) VALUES (?, ?)",
        [name, description]
      );
    }

    // Add permissions
    const modules = await this.all("SELECT * FROM modules");
    const actions = ["create", "read", "update", "delete"];

    for (const module of modules) {
      for (const action of actions) {
        const permName = `${action}_${module.name.toLowerCase()}`;
        await this.run(
          "INSERT OR IGNORE INTO permissions (name, action, module_id) VALUES (?, ?, ?)",
          [permName, action, module.id]
        );
      }
    }

    // Assign all permissions to Admin role
    const adminRole = await this.get(
      "SELECT id FROM roles WHERE name = 'Admin'"
    );
    if (adminRole) {
      const permissions = await this.all("SELECT id FROM permissions");
      for (const permission of permissions) {
        await this.run(
          "INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
          [adminRole.id, permission.id]
        );
      }
    }

    // Assign Admin role to Administrators group
    const adminGroup = await this.get(
      "SELECT id FROM groups WHERE name = 'Administrators'"
    );
    if (adminGroup && adminRole) {
      await this.run(
        "INSERT OR IGNORE INTO group_roles (group_id, role_id) VALUES (?, ?)",
        [adminGroup.id, adminRole.id]
      );
    }

    // Create default admin user
    const hashedPassword = bcrypt.hashSync("admin123", 12);
    const existingAdmin = await this.get(
      "SELECT id FROM users WHERE username = ?",
      ["admin"]
    );
    if (!existingAdmin) {
      const result = await this.run(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        ["admin", "admin@system.com", hashedPassword]
      );
      const adminUserId = result.lastID;
      await this.run(
        "INSERT OR IGNORE INTO user_groups (user_id, group_id) VALUES (?, ?)",
        [adminUserId, adminGroup.id]
      );
    }
  }

  getDB() {
    return this.db;
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.log("Something went wrong closing DB:", err.message);
      } else {
        console.log("Database has been closed");
      }
    });
  }
}

export default new Database();
