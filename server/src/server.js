import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { configureCors } from "./config/cors.js";
import Database from "./config/database.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/users.route.js";
import groupRoutes from "./routes/group.route.js";
import roleRoutes from "./routes/roles.route.js";
import moduleRoutes from "./routes/module.route.js";
import permissionsRoutes from "./routes/permissions.route.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
configureCors(app);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/permissions", permissionsRoutes);

// Error handling middleware
app.use(errorHandler);

// Catch-all route for 404 errors
app.all("/*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Initialize database and start server
async function startServer() {
  try {
    await Database.initialize();
    app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
