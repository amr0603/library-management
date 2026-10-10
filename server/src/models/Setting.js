import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "مكتبة شهد المعارف",
    },
    storeAddress: {
      type: String,
      default: "المملكة العربية السعودية",
    },
    storePhone: {
      type: String,
      default: "+966500000000",
    },
    currency: {
      type: String,
      default: "ر.س",
    },
    taxNumber: {
      type: String,
      default: "",
    },
    lowStockThresholdDefault: {
      type: Number,
      default: 5,
    },
    units: {
      type: [String],
      default: ["قطعة", "علبة", "درزن", "رزمة", "كرتون", "حزمة", "طقم", "متر"],
    },
    receiptFooterNote: {
      type: String,
      default: "شكراً لتعاملكم مع مكتبة شهد المعارف",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Setting", settingSchema);
