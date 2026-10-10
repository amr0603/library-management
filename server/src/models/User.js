import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "اسم المستخدم مطلوب"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "اسم الدخول مطلوب"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },
    permissions: {
      canManageProducts: { type: Boolean, default: true },
      canCreateMovements: { type: Boolean, default: true },
      canViewReports: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false },
      canManageUsers: { type: Boolean, default: false },
      canPerformStocktake: { type: Boolean, default: false },
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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
