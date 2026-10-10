import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";

export const getProducts = async (req, res, next) => {
  try {
    const { search, category, status, lowStock, page = 1, limit = 20, sortField = "createdAt", sortOrder = "desc" } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { code: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;

    if (lowStock === "true") {
      query.$expr = { $lte: ["$currentStock", "$minStock"] };
    }

    const currentPage = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (currentPage - 1) * pageLimit;

    const sortOptions = {};
    sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .sort(sortOptions)
        .skip(skip)
        .limit(pageLimit),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products,
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

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) {
      return res.status(404).json({ success: false, message: "المنتج غير موجود" });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      code,
      name,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      openingStock,
      minStock,
      description,
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: "كود المنتج مطلوب" });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "اسم المنتج مطلوب" });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: "تصنيف المنتج مطلوب" });
    }

    const existingCode = await Product.findOne({ code: code.trim().toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ success: false, message: "كود المنتج مستخدم مسبقاً، يرجى استخدام كود فريد" });
    }

    const openStockNum = Number(openingStock) || 0;

    const product = await Product.create({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      unit: unit || "قطعة",
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      openingStock: openStockNum,
      currentStock: openStockNum,
      minStock: Number(minStock) || 5,
      description: description || "",
      isActive: true,
    });

    res.status(201).json({ success: true, message: "تمت إضافة المنتج بنجاح", data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const {
      code,
      name,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      minStock,
      description,
      isActive,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "المنتج غير موجود" });
    }

    if (code && code.trim().toUpperCase() !== product.code) {
      const existing = await Product.findOne({ code: code.trim().toUpperCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: "الكود الجديد مستخدم بالفعل لمنتج آخر" });
      }
      product.code = code.trim().toUpperCase();
    }

    if (name) product.name = name.trim();
    if (category) product.category = category;
    if (unit) product.unit = unit;
    if (purchasePrice !== undefined) product.purchasePrice = Number(purchasePrice);
    if (sellingPrice !== undefined) product.sellingPrice = Number(sellingPrice);
    if (minStock !== undefined) product.minStock = Number(minStock);
    if (description !== undefined) product.description = description;
    if (typeof isActive === "boolean") product.isActive = isActive;

    await product.save();
    res.json({ success: true, message: "تم تحديث بيانات المنتج بنجاح", data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProductStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "المنتج غير موجود" });
    }

    product.isActive = isActive;
    await product.save();

    res.json({
      success: true,
      message: `تم ${isActive ? "تفعيل" : "تعطيل"} المنتج بنجاح`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const movementsCount = await StockMovement.countDocuments({ product: req.params.id });
    if (movementsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن حذف هذا المنتج لوجود (${movementsCount}) حركة مخزنية سابقة مرتبطة به. طبقاً لسياسة السلامة يمكنك تعطيل المنتج بدلاً من حذفه نهائياً`,
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم حذف المنتج بنجاح" });
  } catch (error) {
    next(error);
  }
};
