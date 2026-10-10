import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import { generateMovementNumber } from "../utils/numberGenerator.js";

export const getMovements = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      product,
      supplier,
      recipient,
      startDate,
      endDate,
      search,
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (product) query.product = product;
    if (supplier) query.supplier = supplier;
    if (recipient) query.recipient = recipient;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { movementNumber: { $regex: search.trim(), $options: "i" } },
        { reference: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const currentPage = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (currentPage - 1) * pageLimit;

    const [movements, total] = await Promise.all([
      StockMovement.find(query)
        .populate("product", "name code unit")
        .populate("supplier", "name phone")
        .populate("recipient", "name type")
        .populate("createdBy", "name username")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      StockMovement.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: movements,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMovementById = async (req, res, next) => {
  try {
    const movement = await StockMovement.findById(req.params.id)
      .populate("product")
      .populate("supplier")
      .populate("recipient")
      .populate("createdBy", "name username");

    if (!movement) {
      return res.status(404).json({ success: false, message: "سند الحركة غير موجود" });
    }

    res.json({ success: true, data: movement });
  } catch (error) {
    next(error);
  }
};

export const createIncomingMovement = async (req, res, next) => {
  try {
    const { productId, quantity, unitPrice, supplier, reference, notes, date } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "المنتج مطلوب" });
    }

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      return res.status(400).json({ success: false, message: "الكمية الواردة يجب أن تكون رقماً موجباً أكبر من صفر" });
    }

    const price = Number(unitPrice);
    if (price < 0) {
      return res.status(400).json({ success: false, message: "سعر الوحدة لا يمكن أن يكون سالباً" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "المنتج غير موجود" });
    }
    if (!product.isActive) {
      return res.status(400).json({ success: false, message: "لا يمكن إضافة رصيد لمنتج معطل" });
    }

    const stockBefore = product.currentStock;
    const stockAfter = Number((stockBefore + qty).toFixed(2));
    const movementNumber = await generateMovementNumber("IN");

    const movement = await StockMovement.create({
      movementNumber,
      product: product._id,
      type: "IN",
      quantity: qty,
      unitPrice: price,
      totalValue: Number((qty * price).toFixed(2)),
      date: date ? new Date(date) : new Date(),
      supplier: supplier || null,
      reason: "purchase",
      reference: reference || "",
      notes: notes || "",
      stockBefore,
      stockAfter,
      createdBy: req.user._id,
    });

    product.currentStock = stockAfter;
    if (price > 0) {
      product.purchasePrice = price;
    }
    await product.save();

    res.status(201).json({
      success: true,
      message: `تم تسجيل سند الإدخال المخزني بنجاح برقم: ${movementNumber}`,
      data: movement,
    });
  } catch (error) {
    next(error);
  }
};

export const createOutgoingMovement = async (req, res, next) => {
  try {
    const { productId, quantity, recipient, reason, reference, notes, date } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "المنتج مطلوب" });
    }

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      return res.status(400).json({ success: false, message: "الكمية المصروفة يجب أن تكون رقماً موجباً أكبر من صفر" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "المنتج غير موجود" });
    }
    if (!product.isActive) {
      return res.status(400).json({ success: false, message: "المنتج معطل حالياً" });
    }

    if (product.currentStock < qty) {
      return res.status(400).json({
        success: false,
        message: `الرصيد المتاح حالياً (${product.currentStock} ${product.unit}) غير كافٍ لصرف كمية (${qty} ${product.unit}). يمنع النظام الرصيد السالب بشكل قاطع`,
      });
    }

    const stockBefore = product.currentStock;
    const stockAfter = Number((stockBefore - qty).toFixed(2));
    const unitPrice = product.purchasePrice || 0;
    const movementNumber = await generateMovementNumber("OUT");

    const movement = await StockMovement.create({
      movementNumber,
      product: product._id,
      type: "OUT",
      quantity: qty,
      unitPrice,
      totalValue: Number((qty * unitPrice).toFixed(2)),
      date: date ? new Date(date) : new Date(),
      recipient: recipient || null,
      reason: reason || "sale",
      reference: reference || "",
      notes: notes || "",
      stockBefore,
      stockAfter,
      createdBy: req.user._id,
    });

    product.currentStock = stockAfter;
    await product.save();

    res.status(201).json({
      success: true,
      message: `تم تسجيل سند الإخراج المخزني بنجاح برقم: ${movementNumber}`,
      data: movement,
    });
  } catch (error) {
    next(error);
  }
};

export const reverseMovement = async (req, res, next) => {
  try {
    const original = await StockMovement.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ success: false, message: "الحركة المراد عكسها غير موجودة" });
    }

    if (original.isReversed) {
      return res.status(400).json({ success: false, message: "تم عكس هذه الحركة مسبقاً ولا يمكن عكسها مرة أخرى" });
    }

    if (original.type === "REVERSAL") {
      return res.status(400).json({ success: false, message: "لا يمكن عكس سند عكسي" });
    }

    const product = await Product.findById(original.product);
    if (!product) {
      return res.status(404).json({ success: false, message: "المنتج المرتبط بالحركة غير موجود" });
    }

    let newStock = product.currentStock;
    if (original.type === "IN" || original.type === "ADJUSTMENT_IN") {
      if (product.currentStock < original.quantity) {
        return res.status(400).json({
          success: false,
          message: `لا يمكن إلغاء هذا الوارد لأن الرصيد الحالي (${product.currentStock}) أقل من الكمية المراد خصمها (${original.quantity})، مما سيؤدي إلى رصيد سالب`,
        });
      }
      newStock = Number((product.currentStock - original.quantity).toFixed(2));
    } else if (original.type === "OUT" || original.type === "ADJUSTMENT_OUT") {
      newStock = Number((product.currentStock + original.quantity).toFixed(2));
    }

    const reversalMovementNumber = await generateMovementNumber("REV");

    const reversalRecord = await StockMovement.create({
      movementNumber: reversalMovementNumber,
      product: product._id,
      type: "REVERSAL",
      quantity: original.quantity,
      unitPrice: original.unitPrice,
      totalValue: original.totalValue,
      date: new Date(),
      supplier: original.supplier,
      recipient: original.recipient,
      reason: "reversal",
      reference: `عكس السند رقم: ${original.movementNumber}`,
      notes: `حركة عكسية تدقيقية لإلغاء السند: ${original.movementNumber}`,
      stockBefore: product.currentStock,
      stockAfter: newStock,
      createdBy: req.user._id,
      reversedMovement: original._id,
    });

    original.isReversed = true;
    await original.save();

    product.currentStock = newStock;
    await product.save();

    res.json({
      success: true,
      message: `تم إلغاء الحركة وتوثيق السند العكسي بنجاح برقم: ${reversalMovementNumber}`,
      data: reversalRecord,
    });
  } catch (error) {
    next(error);
  }
};
