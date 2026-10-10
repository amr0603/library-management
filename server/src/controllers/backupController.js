import fs from "fs";
import path from "path";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import Supplier from "../models/Supplier.js";
import Recipient from "../models/Recipient.js";
import Stocktaking from "../models/Stocktaking.js";
import Setting from "../models/Setting.js";

const BACKUP_DIR = path.resolve(process.cwd(), "backups");

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export const createBackup = async (req, res, next) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-shahd-inventory-${timestamp}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    const [users, categories, products, stockMovements, suppliers, recipients, stocktakings, settings] =
      await Promise.all([
        User.find().lean(),
        Category.find().lean(),
        Product.find().lean(),
        StockMovement.find().lean(),
        Supplier.find().lean(),
        Recipient.find().lean(),
        Stocktaking.find().lean(),
        Setting.find().lean(),
      ]);

    const backupData = {
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      appName: "Library Management System - Shahd Al-Maarif",
      data: {
        users,
        categories,
        products,
        stockMovements,
        suppliers,
        recipients,
        stocktakings,
        settings,
      },
    };

    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), "utf8");

    res.json({
      success: true,
      message: `تم إنشاء النسخة الاحتياطية بنجاح وحفظها في: ${filename}`,
      filename,
      size: (fs.statSync(filePath).size / 1024).toFixed(2) + " KB",
      createdAt: backupData.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

export const listBackups = async (req, res, next) => {
  try {
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const stats = fs.statSync(path.join(BACKUP_DIR, file));
        return {
          filename: file,
          size: (stats.size / 1024).toFixed(2) + " KB",
          createdAt: stats.birthtime,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
};

export const restoreBackup = async (req, res, next) => {
  try {
    const { filename, backupPayload } = req.body;
    let dataToRestore = null;

    if (filename) {
      const filePath = path.join(BACKUP_DIR, filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: "ملف النسخة الاحتياطية غير موجود" });
      }
      const raw = fs.readFileSync(filePath, "utf8");
      dataToRestore = JSON.parse(raw);
    } else if (backupPayload) {
      dataToRestore = backupPayload;
    } else {
      return res.status(400).json({ success: false, message: "يرجى تحديد اسم الملف أو توفير محتوى النسخة" });
    }

    if (!dataToRestore || !dataToRestore.data) {
      return res.status(400).json({ success: false, message: "ملف النسخة الاحتياطية غير صالح أو تالف" });
    }

    const { users, categories, products, stockMovements, suppliers, recipients, stocktakings, settings } =
      dataToRestore.data;

    // Restore collections
    if (categories && categories.length > 0) {
      await Category.deleteMany({});
      await Category.insertMany(categories);
    }
    if (products && products.length > 0) {
      await Product.deleteMany({});
      await Product.insertMany(products);
    }
    if (stockMovements && stockMovements.length > 0) {
      await StockMovement.deleteMany({});
      await StockMovement.insertMany(stockMovements);
    }
    if (suppliers && suppliers.length > 0) {
      await Supplier.deleteMany({});
      await Supplier.insertMany(suppliers);
    }
    if (recipients && recipients.length > 0) {
      await Recipient.deleteMany({});
      await Recipient.insertMany(recipients);
    }
    if (stocktakings && stocktakings.length > 0) {
      await Stocktaking.deleteMany({});
      await Stocktaking.insertMany(stocktakings);
    }
    if (settings && settings.length > 0) {
      await Setting.deleteMany({});
      await Setting.insertMany(settings);
    }
    if (users && users.length > 0) {
      await User.deleteMany({});
      await User.insertMany(users);
    }

    res.json({
      success: true,
      message: "تمت استعادة قاعدة البيانات بالكامل بنجاح وتحديث كافة السجلات",
    });
  } catch (error) {
    next(error);
  }
};
