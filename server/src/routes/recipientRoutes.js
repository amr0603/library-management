import express from "express";
import {
  getRecipients,
  createRecipient,
  updateRecipient,
  deleteRecipient,
} from "../controllers/recipientController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getRecipients);
router.post("/", protect, requirePermission("canManageProducts"), createRecipient);
router.patch("/:id", protect, requirePermission("canManageProducts"), updateRecipient);
router.delete("/:id", protect, requirePermission("canManageProducts"), deleteRecipient);

export default router;
