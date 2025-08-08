import express from "express";
import {
  authenticateToken,
  checkPermission,
} from "../middlewares/auth.middleware.js";
import {
  validateRole,
  validateId,
  validateAssignment,
} from "../middlewares/validation.middleware.js";
import {
  assignPermissionsToRole,
  createRole,
  deleteRole,
  indexRoles,
  removePermissionFromRole,
  showRole,
  updateRole,
} from "../controllers/roles.controller.js";
const router = express.Router();

router.get(
  "/",
  authenticateToken,
  checkPermission("Roles", "read"),
  indexRoles
);

// Get role by ID
router.get(
  "/:id",
  authenticateToken,
  checkPermission("Roles", "read"),
  validateId,
  showRole
);

// Create role
router.post(
  "/",
  authenticateToken,
  checkPermission("Roles", "create"),
  validateRole,
  createRole
);

// Update role
router.put(
  "/:id",
  authenticateToken,
  checkPermission("Roles", "update"),
  validateId,
  validateRole,
  updateRole
);

// Delete role
router.delete(
  "/:id",
  authenticateToken,
  checkPermission("Roles", "delete"),
  validateId,
  deleteRole
);

// Assign permissions to role
router.post(
  "/:id/permissions",
  authenticateToken,
  checkPermission("Roles", "update"),
  validateId,
  validateAssignment,
  assignPermissionsToRole
);

// Remove permission from role
router.delete(
  "/:id/permissions/:permissionId",
  authenticateToken,
  checkPermission("Roles", "update"),
  validateId,
  removePermissionFromRole
);

export default router;
