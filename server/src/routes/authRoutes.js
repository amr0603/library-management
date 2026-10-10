import express from "express";
import { login, getMe, changePassword, getUsers, createUser, updateUser } from "../controllers/authController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/change-password", protect, changePassword);

// Users management
router.get("/users", protect, requireAdmin, getUsers);
router.post("/users", protect, requireAdmin, createUser);
router.patch("/users/:id", protect, requireAdmin, updateUser);

export default router;
