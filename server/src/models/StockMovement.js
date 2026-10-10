import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    movementNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "المنتج مطلوب"],
      index: true,
    },
    type: {
      type: String,
      enum: ["IN", "OUT", "ADJUSTMENT_IN", "ADJUSTMENT_OUT", "REVERSAL"],
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.01, "الكمية يجب أن تكون أكبر من صفر"],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalValue: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipient",
      default: null,
    },
    reason: {
      type: String,
      enum: [
        "purchase",
        "sale",
        "internal_use",
        "distribution",
        "damaged",
        "supplier_return",
        "stocktake_surplus",
        "stocktake_deficit",
        "reversal",
        "other",
      ],
      default: "purchase",
    },
    reference: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    stockBefore: {
      type: Number,
      required: true,
    },
    stockAfter: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reversedMovement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockMovement",
      default: null,
    },
    isReversed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("StockMovement", stockMovementSchema);
