import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "super_secure_shahd_inventory_jwt_secret_2026_xyz!@#", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "يرجى إدخال اسم المستخدم وكلمة المرور" });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "تم تعطيل هذا الحساب. يرجى مراجعة المسؤول" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "يرجى تقديم كلمة المرور الحالية والجديدة" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "يجب ألا تقل كلمة المرور الجديدة عن 6 خانات" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "كلمة المرور الحالية غير صحيحة" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, username, password, role, permissions } = req.body;
    const existing = await User.findOne({ username: username?.toLowerCase()?.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "اسم الدخول مسجل بالفعل لمستخدم آخر" });
    }

    const user = await User.create({
      name,
      username,
      password,
      role: role || "employee",
      permissions: permissions || {},
    });

    res.status(201).json({
      success: true,
      message: "تم إنشاء المستخدم بنجاح",
      data: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, role, permissions, isActive, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "المستخدم غير موجود" });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (permissions) user.permissions = permissions;
    if (typeof isActive === "boolean") user.isActive = isActive;
    if (password && password.trim().length >= 6) {
      user.password = password;
    }

    await user.save();
    res.json({ success: true, message: "تم تحديث بيانات المستخدم بنجاح" });
  } catch (error) {
    next(error);
  }
};
