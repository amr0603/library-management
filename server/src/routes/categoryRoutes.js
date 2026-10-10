import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getCategories);
router.post("/", protect, requirePermission("canManageProducts"), createCategory);
router.patch("/:id", protect, requirePermission("canManageProducts"), updateCategory);
router.delete("/:id", protect, requirePermission("canManageProducts"), deleteCategory);

export default router;
