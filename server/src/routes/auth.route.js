import express from "express";
import {
  validateUser,
  validateLogin,
} from "../middlewares/validation.middleware.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { login, permissions, signup, simulateAction } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", validateUser, signup);

router.post("/login", validateLogin, login);

router.get("/me/permissions", authenticateToken, permissions);

router.post("/simulate-action", authenticateToken, simulateAction);

export default router;
