import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import movementRoutes from "./routes/movementRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import recipientRoutes from "./routes/recipientRoutes.js";
import stocktakingRoutes from "./routes/stocktakingRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";
import backupRoutes from "./routes/backupRoutes.js";

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Library Inventory Management System - Shahd Al-Maarif",
    time: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/movements", movementRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/recipients", recipientRoutes);
app.use("/api/stocktaking", stocktakingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/backups", backupRoutes);

// Error Handler
app.use(errorHandler);

export default app;
