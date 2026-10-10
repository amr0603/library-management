import mongoose from "mongoose";

const recipientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "اسم الجهة المستلمة أو العميل مطلوب"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["department", "customer", "branch", "other"],
      default: "customer",
    },
    contactPerson: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Recipient", recipientSchema);
