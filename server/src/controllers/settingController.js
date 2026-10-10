import Setting from "../models/Setting.js";

export const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    const {
      storeName,
      storeAddress,
      storePhone,
      currency,
      taxNumber,
      lowStockThresholdDefault,
      units,
      receiptFooterNote,
    } = req.body;

    if (storeName) settings.storeName = storeName;
    if (storeAddress) settings.storeAddress = storeAddress;
    if (storePhone) settings.storePhone = storePhone;
    if (currency) settings.currency = currency;
    if (taxNumber !== undefined) settings.taxNumber = taxNumber;
    if (lowStockThresholdDefault !== undefined) settings.lowStockThresholdDefault = Number(lowStockThresholdDefault);
    if (units && Array.isArray(units)) settings.units = units;
    if (receiptFooterNote !== undefined) settings.receiptFooterNote = receiptFooterNote;

    await settings.save();
    res.json({ success: true, message: "تم حفظ الإعدادات بنجاح", data: settings });
  } catch (error) {
    next(error);
  }
};
