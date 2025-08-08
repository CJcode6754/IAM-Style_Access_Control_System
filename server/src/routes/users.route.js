import express from "express";
import {
  authenticateToken,
  checkPermission,
} from "../middlewares/auth.middleware.js";
import { validateUser, validateId } from "../middlewares/validation.middleware.js";
import {
  createUser,
  deleteUser,
  indexUser,
  showUser,
  updateUser,
} from "../controllers/userManagement.controller.js";

const router = express.Router();

router.get("/", authenticateToken, checkPermission("Users", "read"), indexUser);

// Get user by ID
router.get(
  "/:id",
  authenticateToken,
  checkPermission("Users", "read"),
  validateId,
  showUser
);

// Create user
router.post(
  "/",
  authenticateToken,
  checkPermission("Users", "create"),
  validateUser,
  createUser
);

router.put(
  "/:id",
  authenticateToken,
  checkPermission("Users", "update"),
  validateId,
  updateUser
);

// DELETE user
router.delete(
  "/:id",
  authenticateToken,
  checkPermission("Users", "delete"),
  validateId,
  deleteUser
);

export default router;