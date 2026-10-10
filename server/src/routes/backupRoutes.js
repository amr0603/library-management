import express from "express";
import { createBackup, listBackups, restoreBackup } from "../controllers/backupController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", protect, requireAdmin, createBackup);
router.get("/list", protect, requireAdmin, listBackups);
router.post("/restore", protect, requireAdmin, restoreBackup);

export default router;
