import express from "express";
import { getSettings, updateSettings } from "../controllers/settingController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getSettings);
router.put("/", protect, requirePermission("canManageSettings"), updateSettings);

export default router;
