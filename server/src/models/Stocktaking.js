import mongoose from "mongoose";

const stocktakingSchema = new mongoose.Schema(
  {
    stocktakeNumber: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    systemStock: {
      type: Number,
      required: true,
    },
    actualStock: {
      type: Number,
      required: true,
    },
    difference: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: [true, "سبب التسوية مطلوب"],
    },
    notes: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockMovement",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Stocktaking", stocktakingSchema);
