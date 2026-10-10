import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import Category from "../models/Category.js";

export const getDashboardSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const [activeProductsCount, totalCategoriesCount, lowStockProducts] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Product.find({
        isActive: true,
        $expr: { $lte: ["$currentStock", "$minStock"] },
      })
        .populate("category", "name")
        .limit(10),
    ]);

    // Total stock quantity & inventory purchase value
    const allProducts = await Product.find({ isActive: true });
    let totalStockQuantity = 0;
    let totalInventoryValue = 0;

    for (const p of allProducts) {
      totalStockQuantity += p.currentStock || 0;
      totalInventoryValue += (p.currentStock || 0) * (p.purchasePrice || 0);
    }

    const movementDateQuery = {};
    if (startDate || endDate) {
      movementDateQuery.date = {};
      if (startDate) movementDateQuery.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        movementDateQuery.date.$lte = end;
      }
    }

    const inMovements = await StockMovement.find({
      ...movementDateQuery,
      type: { $in: ["IN", "ADJUSTMENT_IN"] },
      isReversed: false,
    });

    const outMovements = await StockMovement.find({
      ...movementDateQuery,
      type: { $in: ["OUT", "ADJUSTMENT_OUT"] },
      isReversed: false,
    });

    const totalInQty = inMovements.reduce((sum, m) => sum + (m.quantity || 0), 0);
    const totalOutQty = outMovements.reduce((sum, m) => sum + (m.quantity || 0), 0);
    const totalInValue = inMovements.reduce((sum, m) => sum + (m.totalValue || 0), 0);
    const totalOutValue = outMovements.reduce((sum, m) => sum + (m.totalValue || 0), 0);

    const recentMovements = await StockMovement.find()
      .populate("product", "name code unit")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(8);

    // Chart Data for last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      last7Days.push(dayStr);
    }

    const chartData = await Promise.all(
      last7Days.map(async (dayStr) => {
        const start = new Date(dayStr);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dayStr);
        end.setHours(23, 59, 59, 999);

        const [inList, outList] = await Promise.all([
          StockMovement.find({
            date: { $gte: start, $lte: end },
            type: { $in: ["IN", "ADJUSTMENT_IN"] },
            isReversed: false,
          }),
          StockMovement.find({
            date: { $gte: start, $lte: end },
            type: { $in: ["OUT", "ADJUSTMENT_OUT"] },
            isReversed: false,
          }),
        ]);

        const incoming = inList.reduce((acc, cur) => acc + (cur.quantity || 0), 0);
        const outgoing = outList.reduce((acc, cur) => acc + (cur.quantity || 0), 0);

        return {
          date: dayStr,
          incoming,
          outgoing,
        };
      })
    );

    res.json({
      success: true,
      data: {
        activeProductsCount,
        totalCategoriesCount,
        totalStockQuantity: Number(totalStockQuantity.toFixed(2)),
        totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
        periodInQty: Number(totalInQty.toFixed(2)),
        periodOutQty: Number(totalOutQty.toFixed(2)),
        periodInValue: Number(totalInValue.toFixed(2)),
        periodOutValue: Number(totalOutValue.toFixed(2)),
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        recentMovements,
        chartData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStockReport = async (req, res, next) => {
  try {
    const { category, lowStockOnly } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (lowStockOnly === "true") {
      query.$expr = { $lte: ["$currentStock", "$minStock"] };
    }

    const products = await Product.find(query).populate("category", "name").sort({ name: 1 });

    let totalCost = 0;
    let totalSale = 0;
    let totalUnits = 0;

    const items = products.map((p) => {
      const stock = p.currentStock || 0;
      const cVal = stock * (p.purchasePrice || 0);
      const sVal = stock * (p.sellingPrice || 0);
      totalUnits += stock;
      totalCost += cVal;
      totalSale += sVal;

      return {
        id: p._id,
        code: p.code,
        name: p.name,
        category: p.category?.name || "بدون تصنيف",
        unit: p.unit,
        currentStock: stock,
        minStock: p.minStock,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        totalPurchaseValue: Number(cVal.toFixed(2)),
        totalSellingValue: Number(sVal.toFixed(2)),
        isLowStock: stock <= p.minStock,
      };
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts: items.length,
          totalUnits: Number(totalUnits.toFixed(2)),
          totalPurchaseCost: Number(totalCost.toFixed(2)),
          totalSellingValue: Number(totalSale.toFixed(2)),
        },
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMovementsReport = async (req, res, next) => {
  try {
    const { type, startDate, endDate, productId, supplierId, recipientId } = req.query;

    const query = {};
    if (type) query.type = type;
    if (productId) query.product = productId;
    if (supplierId) query.supplier = supplierId;
    if (recipientId) query.recipient = recipientId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const movements = await StockMovement.find(query)
      .populate("product", "name code unit")
      .populate("supplier", "name")
      .populate("recipient", "name")
      .populate("createdBy", "name")
      .sort({ date: -1 });

    const totalQty = movements.reduce((sum, m) => sum + (m.quantity || 0), 0);
    const totalVal = movements.reduce((sum, m) => sum + (m.totalValue || 0), 0);

    res.json({
      success: true,
      data: {
        summary: {
          count: movements.length,
          totalQuantity: Number(totalQty.toFixed(2)),
          totalValue: Number(totalVal.toFixed(2)),
        },
        items: movements,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductLedger = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate("category", "name");
    if (!product) {
      return res.status(404).json({ success: false, message: "المنتج غير موجود" });
    }

    const movements = await StockMovement.find({ product: productId })
      .populate("supplier", "name")
      .populate("recipient", "name")
      .populate("createdBy", "name")
      .sort({ date: 1, createdAt: 1 });

    res.json({
      success: true,
      data: {
        product,
        movements,
      },
    });
  } catch (error) {
    next(error);
  }
};
