import Product from "../models/Product.js";
import Stocktaking from "../models/Stocktaking.js";
import StockMovement from "../models/StockMovement.js";
import { generateMovementNumber, generateStocktakeNumber } from "../utils/numberGenerator.js";

export const getStocktakes = async (req, res, next) => {
  try {
    const list = await Stocktaking.find()
      .populate("product", "name code unit")
      .populate("createdBy", "name username")
      .populate("movement")
      .sort({ date: -1 });

    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const createStocktakeAdjustment = async (req, res, next) => {
  try {
    const { productId, actualStock, reason, notes } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "يرجى تحديد الصنف المراد جرده" });
    }

    const actual = Number(actualStock);
    if (isNaN(actual) || actual < 0) {
      return res.status(400).json({ success: false, message: "الرصيد الفعلي يجب أن يكون رقماً صحيحاً أو عشرياً موجباً" });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: "سبب التسوية المخزنية إلزامي للتوثيق المالي" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "المنتج غير موجود" });
    }

    const systemStock = product.currentStock;
    const diff = Number((actual - systemStock).toFixed(2));

    if (diff === 0) {
      return res.status(400).json({
        success: false,
        message: "الرصيد الفعلي مطابق تماماً للرصيد الدفتري المسجل في النظام، لا حاجة لإجراء تسوية",
      });
    }

    const stocktakeNumber = await generateStocktakeNumber();
    let movementDoc = null;

    if (diff > 0) {
      // Surplus
      const movNumber = await generateMovementNumber("ADJ-IN");
      movementDoc = await StockMovement.create({
        movementNumber: movNumber,
        product: product._id,
        type: "ADJUSTMENT_IN",
        quantity: Math.abs(diff),
        unitPrice: product.purchasePrice || 0,
        totalValue: Number((Math.abs(diff) * (product.purchasePrice || 0)).toFixed(2)),
        reason: "stocktake_surplus",
        reference: `تسوية جردية: ${stocktakeNumber}`,
        notes: `تسوية فائض جرد: ${reason} - ${notes || ""}`,
        stockBefore: systemStock,
        stockAfter: actual,
        createdBy: req.user._id,
      });
    } else {
      // Deficit
      const movNumber = await generateMovementNumber("ADJ-OUT");
      movementDoc = await StockMovement.create({
        movementNumber: movNumber,
        product: product._id,
        type: "ADJUSTMENT_OUT",
        quantity: Math.abs(diff),
        unitPrice: product.purchasePrice || 0,
        totalValue: Number((Math.abs(diff) * (product.purchasePrice || 0)).toFixed(2)),
        reason: "stocktake_deficit",
        reference: `تسوية جردية: ${stocktakeNumber}`,
        notes: `تسوية عجز جرد: ${reason} - ${notes || ""}`,
        stockBefore: systemStock,
        stockAfter: actual,
        createdBy: req.user._id,
      });
    }

    product.currentStock = actual;
    await product.save();

    const stocktakeRecord = await Stocktaking.create({
      stocktakeNumber,
      product: product._id,
      systemStock,
      actualStock: actual,
      difference: diff,
      reason: reason.trim(),
      notes: notes || "",
      createdBy: req.user._id,
      movement: movementDoc?._id,
    });

    res.status(201).json({
      success: true,
      message: `تم اعتماد التسوية الجردية وتحديث الرصيد الفعلي إلى (${actual} ${product.unit}) بنجاح`,
      data: stocktakeRecord,
    });
  } catch (error) {
    next(error);
  }
};
