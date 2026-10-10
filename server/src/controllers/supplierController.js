import Supplier from "../models/Supplier.js";
import StockMovement from "../models/StockMovement.js";

export const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json({ success: true, data: suppliers });
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    const { name, phone, address, contactPerson, notes } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "اسم المورد مطلوب" });
    }

    const supplier = await Supplier.create({ name: name.trim(), phone, address, contactPerson, notes });
    res.status(201).json({ success: true, message: "تمت إضافة المورد بنجاح", data: supplier });
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) {
      return res.status(404).json({ success: false, message: "المورد غير موجود" });
    }
    res.json({ success: true, message: "تم تحديث بيانات المورد بنجاح", data: supplier });
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const count = await StockMovement.countDocuments({ supplier: req.params.id });
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن حذف هذا المورد لوجود (${count}) عمليات توريد مسجلة باسمه. يمكنك تعطيله بدلاً من ذلك`,
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم حذف المورد بنجاح" });
  } catch (error) {
    next(error);
  }
};
