import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "كود المنتج مطلوب"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "اسم المنتج مطلوب"],
      trim: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "تصنيف المنتج مطلوب"],
      index: true,
    },
    unit: {
      type: String,
      required: [true, "وحدة القياس مطلوبة"],
      default: "قطعة",
    },
    purchasePrice: {
      type: Number,
      required: [true, "سعر الشراء مطلوب"],
      min: [0, "سعر الشراء لا يمكن أن يكون سالباً"],
      default: 0,
    },
    sellingPrice: {
      type: Number,
      required: [true, "سعر البيع مطلوب"],
      min: [0, "سعر البيع لا يمكن أن يكون سالباً"],
      default: 0,
    },
    openingStock: {
      type: Number,
      required: true,
      min: [0, "الرصيد الافتتاحي لا يمكن أن يكون سالباً"],
      default: 0,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      index: true,
    },
    minStock: {
      type: Number,
      required: [true, "حد الطلب الأدنى مطلوب"],
      min: [0, "حد الطلب لا يمكن أن يكون سالباً"],
      default: 5,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: "text", code: "text" });

export default mongoose.model("Product", productSchema);
