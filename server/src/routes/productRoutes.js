import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getProducts);
router.get("/:id", protect, getProductById);
router.post("/", protect, requirePermission("canManageProducts"), createProduct);
router.patch("/:id", protect, requirePermission("canManageProducts"), updateProduct);
router.patch("/:id/status", protect, requirePermission("canManageProducts"), updateProductStatus);
router.delete("/:id", protect, requirePermission("canManageProducts"), deleteProduct);

export default router;
