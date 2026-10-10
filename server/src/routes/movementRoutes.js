import express from "express";
import {
  getMovements,
  getMovementById,
  createIncomingMovement,
  createOutgoingMovement,
  reverseMovement,
} from "../controllers/movementController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getMovements);
router.get("/:id", protect, getMovementById);
router.post("/in", protect, requirePermission("canCreateMovements"), createIncomingMovement);
router.post("/out", protect, requirePermission("canCreateMovements"), createOutgoingMovement);
router.post("/:id/reversal", protect, requirePermission("canCreateMovements"), reverseMovement);

export default router;
