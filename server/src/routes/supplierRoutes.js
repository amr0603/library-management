import express from "express";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getSuppliers);
router.post("/", protect, requirePermission("canManageProducts"), createSupplier);
router.patch("/:id", protect, requirePermission("canManageProducts"), updateSupplier);
router.delete("/:id", protect, requirePermission("canManageProducts"), deleteSupplier);

export default router;
