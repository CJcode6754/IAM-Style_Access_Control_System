import sqlite3 from "sqlite3";

class Database {
  constructor() {
    const self = this;

    self.db = new sqlite3.Database(":memory:", function (err) {
      if (err) {
        console.log(
          "There was a problem connecting to the database:",
          err.message
        );
      } else {
        console.log("Database is ready");
      }
    });
  }

  initialize() {
    this.createTable(() => {
      this.insertSeedData();
    });
  }

  createTable() {
    const createStatements = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Groups table
      `CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Roles table
      `CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Modules table
      `CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Permissions table
      `CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        action TEXT NOT NULL,
        module_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
        UNIQUE (action, module_id)
      )`,

      // User-Groups table
      `CREATE TABLE IF NOT EXISTS user_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        group_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        UNIQUE (user_id, group_id)
      )`,

      // Group-Roles table
      `CREATE TABLE IF NOT EXISTS group_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE (group_id, role_id)
      )`,

      // Role-Permissions table
      `CREATE TABLE IF NOT EXISTS role_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
        UNIQUE (role_id, permission_id)
      )`,
    ];

    for (let i = 0; i < createStatements.length; i++) {
      this.db.run(createStatements[i], function (err) {
        if (err) {
          console.log("Failed to create table:", err.message);
        }
      });
    }
  }

  insertSeedData() {
    const self = this;

    // Predefined modules to insert
    const modulesData = [
      ["Users", "User management module"],
      ["Groups", "Group management module"],
      ["Roles", "Role management module"],
      ["Modules", "Module management module"],
      ["Permissions", "Permission management module"],
    ];

    const insertModule = self.db.prepare(
      "INSERT OR IGNORE INTO modules (name, description) VALUES (?, ?)"
    );

    for (let i = 0; i < modulesData.length; i++) {
      insertModule.run(modulesData[i]);
    }

    insertModule.finalize();

    // After inserting modules, add permissions
    setTimeout(function () {
      self.db.all("SELECT * FROM modules", function (err, rows) {
        if (err) {
          console.log("Could not get modules:", err.message);
          return;
        }

        const actions = ["create", "read", "update", "delete"];
        const insertPermission = self.db.prepare(
          "INSERT OR IGNORE INTO permissions (name, action, module_id) VALUES (?, ?, ?)"
        );

        for (let i = 0; i < rows.length; i++) {
          const module = rows[i];
          for (let j = 0; j < actions.length; j++) {
            const action = actions[j];
            const permName = action + "_" + module.name.toLowerCase();
            insertPermission.run([permName, action, module.id]);
          }
        }

        insertPermission.finalize();
      });
    }, 200);
  }

  getDB() {
    return this.db;
  }

  close() {
    this.db.close(function (err) {
      if (err) {
        console.log("Something went wrong closing DB:", err.message);
      } else {
        console.log("Database has been closed");
      }
    });
  }
}

export default new Database();
