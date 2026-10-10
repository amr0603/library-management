import Recipient from "../models/Recipient.js";
import StockMovement from "../models/StockMovement.js";

export const getRecipients = async (req, res, next) => {
  try {
    const recipients = await Recipient.find().sort({ name: 1 });
    res.json({ success: true, data: recipients });
  } catch (error) {
    next(error);
  }
};

export const createRecipient = async (req, res, next) => {
  try {
    const { name, type, contactPerson, phone, address, notes } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "اسم الجهة المستلمة أو العميل مطلوب" });
    }

    const recipient = await Recipient.create({ name: name.trim(), type, contactPerson, phone, address, notes });
    res.status(201).json({ success: true, message: "تمت إضافة الجهة المستلمة بنجاح", data: recipient });
  } catch (error) {
    next(error);
  }
};

export const updateRecipient = async (req, res, next) => {
  try {
    const recipient = await Recipient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!recipient) {
      return res.status(404).json({ success: false, message: "الجهة المستلمة غير موجودة" });
    }
    res.json({ success: true, message: "تم تحديث البيانات بنجاح", data: recipient });
  } catch (error) {
    next(error);
  }
};

export const deleteRecipient = async (req, res, next) => {
  try {
    const count = await StockMovement.countDocuments({ recipient: req.params.id });
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن الحذف لوجود (${count}) عمليات صرف مسجلة لهذه الجهة. يمكنك تعطيلها بدلاً من ذلك`,
      });
    }

    await Recipient.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم حذف السجل بنجاح" });
  } catch (error) {
    next(error);
  }
};
