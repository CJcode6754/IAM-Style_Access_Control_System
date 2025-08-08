import jwt from 'jsonwebtoken';
import Database from '../config/database.js';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  });
};

const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const db = Database.getDB();

      const query = `
        SELECT DISTINCT p.action, m.name as module_name
        FROM permissions p
        JOIN modules m ON p.module_id = m.id
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN roles r ON rp.role_id = r.id
        JOIN group_roles gr ON r.id = gr.role_id
        JOIN groups g ON gr.group_id = g.id
        JOIN user_groups ug ON g.id = ug.group_id
        WHERE ug.user_id = ? AND m.name = ? AND p.action = ?
      `;

      db.get(query, [userId, moduleName, action], (err, row) => {
        if (err) {
          console.error('Permission check error:', err);
          return res.status(500).json({ message: 'Permission check failed' });
        }

        if (!row) {
          return res.status(403).json({
            message: `Insufficient permissions: ${action} on ${moduleName}`
          });
        }

        next();
      });
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

export { authenticateToken, checkPermission };
