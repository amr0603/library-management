import express from "express";
import { getStocktakes, createStocktakeAdjustment } from "../controllers/stocktakingController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getStocktakes);
router.post("/adjustment", protect, requirePermission("canPerformStocktake"), createStocktakeAdjustment);

export default router;
