import express from 'express';
import { authenticateToken, checkPermission } from '../middlewares/auth.middleware.js';
import { validateModule, validateId } from '../middlewares/validation.middleware.js';
import { createModule, deleteModule, indexModules, showModule, updateModule } from '../controllers/module.controller.js';

const router = express.Router();

router.get('/', authenticateToken, checkPermission('Modules', 'read'), indexModules);

// Get module by ID
router.get('/:id', authenticateToken, checkPermission('Modules', 'read'), validateId, showModule);

// Create module
router.post('/', authenticateToken, checkPermission('Modules', 'create'), validateModule, createModule);

// Update module
router.put('/:id', authenticateToken, checkPermission('Modules', 'update'), validateId, validateModule, updateModule);

// Delete module
router.delete('/:id', authenticateToken, checkPermission('Modules', 'delete'), validateId, deleteModule);

export default router;