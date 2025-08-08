import express from "express";
import {
  authenticateToken,
  checkPermission,
} from "../middlewares/auth.middleware.js";
import {
  validateGroup,
  validateId,
  validateAssignment,
} from "../middlewares/validation.middleware.js";
import {
  assignedUserToGroup,
  assignRolesToGroup,
  createGroup,
  deleteGroup,
  indexGroup,
  removeRoleFromGroup,
  removeUserFromGroup,
  showGroup,
  updateGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  checkPermission("Groups", "read"),
  indexGroup
);

// Get group by ID
router.get(
  "/:id",
  authenticateToken,
  checkPermission("Groups", "read"),
  validateId,
  showGroup
);

// Create group
router.post(
  "/",
  authenticateToken,
  checkPermission("Groups", "create"),
  validateGroup,
  createGroup
);

// Update group
router.put(
  "/:id",
  authenticateToken,
  checkPermission("Groups", "update"),
  validateId,
  validateGroup,
  updateGroup
);

// Delete group
router.delete(
  "/:id",
  authenticateToken,
  checkPermission("Groups", "delete"),
  validateId,
  deleteGroup
);

// Assign users to group
router.post(
  "/:id/users",
  authenticateToken,
  checkPermission("Groups", "update"),
  validateId,
  validateAssignment,
  assignedUserToGroup
);

// Remove user from group
router.delete(
  "/:id/users/:userId",
  authenticateToken,
  checkPermission("Groups", "update"),
  validateId,
  removeUserFromGroup
);

// Assign roles to group
router.post(
  "/:id/roles",
  authenticateToken,
  checkPermission("Groups", "update"),
  validateId,
  validateAssignment,
  assignRolesToGroup
);

// Remove role from group
router.delete(
  "/:id/roles/:roleId",
  authenticateToken,
  checkPermission("Groups", "update"),
  validateId,
  removeRoleFromGroup
);

export default router;
