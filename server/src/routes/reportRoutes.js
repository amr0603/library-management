import express from "express";
import {
  getDashboardSummary,
  getStockReport,
  getMovementsReport,
  getProductLedger,
} from "../controllers/reportController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard/summary", protect, getDashboardSummary);
router.get("/stock", protect, requirePermission("canViewReports"), getStockReport);
router.get("/movements", protect, requirePermission("canViewReports"), getMovementsReport);
router.get("/ledger/:productId", protect, requirePermission("canViewReports"), getProductLedger);

export default router;
