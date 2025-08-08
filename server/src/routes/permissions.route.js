import express from 'express';
import { authenticateToken, checkPermission } from '../middlewares/auth.middleware.js';
import { validateId, validatePermission } from '../middlewares/validation.middleware.js';
import { createPermission, deletePermission, indexPermissions, showPermission, updatePermission } from '../controllers/permissions.controller.js';

const router = express.Router();

router.get('/', authenticateToken, checkPermission('Permissions', 'read'), indexPermissions);

// Get permission by ID
router.get('/:id', authenticateToken, checkPermission('Permissions', 'read'), validateId, showPermission);

// Create permission
router.post('/', authenticateToken, checkPermission('Permissions', 'create'), validatePermission, createPermission);

// Update permission
router.put('/:id', authenticateToken, checkPermission('Permissions', 'update'), validateId, validatePermission, updatePermission);

// Delete permission
router.delete('/:id', authenticateToken, checkPermission('Permissions', 'delete'), validateId, deletePermission);

export default router;