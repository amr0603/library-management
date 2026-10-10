import Category from "../models/Category.js";
import Product from "../models/Product.js";

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "اسم التصنيف مطلوب" });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "هذا التصنيف موجود مسبقاً" });
    }

    const category = await Category.create({ name: name.trim(), description });
    res.status(201).json({ success: true, message: "تمت إضافة التصنيف بنجاح", data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "التصنيف غير موجود" });
    }

    if (name && name.trim() !== category.name) {
      const existing = await Category.findOne({ name: name.trim() });
      if (existing) {
        return res.status(400).json({ success: false, message: "يوجد تصنيف آخر بهذا الاسم" });
      }
      category.name = name.trim();
    }

    if (description !== undefined) category.description = description;
    if (typeof isActive === "boolean") category.isActive = isActive;

    await category.save();
    res.json({ success: true, message: "تم تحديث التصنيف بنجاح", data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const productsCount = await Product.countDocuments({ category: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن حذف هذا التصنيف لوجود (${productsCount}) منتجات مرتبطة به. يمكنك تعطيله بدلاً من ذلك`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم حذف التصنيف بنجاح" });
  } catch (error) {
    next(error);
  }
};
