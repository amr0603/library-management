import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "غير مصرح، يرجى تسجيل الدخول أولاً" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secure_shahd_inventory_jwt_secret_2026_xyz!@#");
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "المستخدم غير موجود أو تم تعطيل حسابه" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "انتهت صلاحية الجلسة أو الرمز غير صالح" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "عذراً، هذه العملية تتطلب صلاحيات المدير (Admin)" });
  }
};

export const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (req.user && (req.user.role === "admin" || (req.user.permissions && req.user.permissions[permissionKey]))) {
      next();
    } else {
      res.status(403).json({ success: false, message: "ليس لديك الصلاحية الكافية لإتمام هذه العملية" });
    }
  };
};
