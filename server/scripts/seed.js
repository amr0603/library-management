import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/User.js";
import Category from "../src/models/Category.js";
import Product from "../src/models/Product.js";
import Supplier from "../src/models/Supplier.js";
import Recipient from "../src/models/Recipient.js";
import Setting from "../src/models/Setting.js";

const seedData = async () => {
  try {
    await connectDB();
    console.log("[Seed] Connected to database. Preparing initial seed...");

    // 1. First Admin User
    const existingAdmin = await User.findOne({ username: "admin" });
    if (!existingAdmin) {
      await User.create({
        name: "مدير النظام",
        username: "admin",
        password: "admin123456",
        role: "admin",
        permissions: {
          canManageProducts: true,
          canCreateMovements: true,
          canViewReports: true,
          canManageSettings: true,
          canManageUsers: true,
          canPerformStocktake: true,
        },
      });
      console.log("[Seed] Created default admin: admin / admin123456");
    }

    // Default Employee
    const existingEmp = await User.findOne({ username: "employee" });
    if (!existingEmp) {
      await User.create({
        name: "أحمد موظف المخزن",
        username: "employee",
        password: "emp123456",
        role: "employee",
        permissions: {
          canManageProducts: true,
          canCreateMovements: true,
          canViewReports: true,
          canManageSettings: false,
          canManageUsers: false,
          canPerformStocktake: false,
        },
      });
      console.log("[Seed] Created default employee: employee / emp123456");
    }

    // 2. Categories
    const categoriesList = [
      { name: "أقلام ومحابر", description: "أقلام حبر وجاف وتحديد ورصاص" },
      { name: "دفاتر وكشاكيل", description: "دفاتر سلك وعادية ومذكرات" },
      { name: "ورق وطباعة", description: "ورق تصوير A4 وورق مقوى وملون" },
      { name: "أدوات هندسية ومساطر", description: "مساطر ومثلثات وبراجيل وأدوات قياس" },
      { name: "أدوات فنية ورسم", description: "ألوان مائية وخشبية وكراسات رسم وفرش" },
      { name: "مستلزمات طابعات وأحبار", description: "خراطيش حبر وليزر وطابعات حرارية" },
      { name: "ملفات وحافظات أوراق", description: "ملفات حفظ وثائق وبلاستيكية ومعدنية" },
      { name: "أدوات مكتبية عامة", description: "دباسات، خرامات، مقصات، ولواصق" },
      { name: "هدايا وتحف مدرسية", description: "إطارات وميداليات وحقائب مدرسية" },
    ];

    for (const cat of categoriesList) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
      }
    }
    console.log("[Seed] Categories ready.");

    // 3. Suppliers
    const suppliersList = [
      { name: "شركة الأهرام للتوريدات المكتبية", phone: "+966511111111", address: "الرياض - حي الملز", contactPerson: "سالم المنصور" },
      { name: "مؤسسة الرواد للقرطاسية والأوراق", phone: "+966522222222", address: "جدة - شارع الستين", contactPerson: "فهد العتيبي" },
      { name: "وكالة الفنون ومستلزمات الرسم", phone: "+966533333333", address: "الدمام - السوق المركزي", contactPerson: "طارق زياد" },
    ];

    for (const sup of suppliersList) {
      const exists = await Supplier.findOne({ name: sup.name });
      if (!exists) {
        await Supplier.create(sup);
      }
    }
    console.log("[Seed] Suppliers ready.");

    // 4. Recipients
    const recipientsList = [
      { name: "قسم المحاسبة والإدارة", type: "department", contactPerson: "ماجد القحطاني", phone: "+966544444444" },
      { name: "مدرسة الأمل النموذجية", type: "customer", contactPerson: "أ. خالد الحربي", phone: "+966555555555" },
      { name: "فرع المكتبة رقم 2", type: "branch", contactPerson: "سعد الشهري", phone: "+966566666666" },
      { name: "عملاء المبيعات المباشرة", type: "customer", contactPerson: "نقطة البيع الرئيسية", phone: "" },
    ];

    for (const rec of recipientsList) {
      const exists = await Recipient.findOne({ name: rec.name });
      if (!exists) {
        await Recipient.create(rec);
      }
    }
    console.log("[Seed] Recipients ready.");

    // 5. Products
    const paperCat = await Category.findOne({ name: "ورق وطباعة" });
    const pensCat = await Category.findOne({ name: "أقلام ومحابر" });
    const booksCat = await Category.findOne({ name: "دفاتر وكشاكيل" });
    const artCat = await Category.findOne({ name: "أدوات فنية ورسم" });
    const officeCat = await Category.findOne({ name: "أدوات مكتبية عامة" });

    const sampleProducts = [
      {
        code: "PAP-001",
        name: "ورق تصوير Double A مقاس A4 وزن 80 جرام",
        category: paperCat?._id,
        unit: "رزمة",
        purchasePrice: 18.5,
        sellingPrice: 24.0,
        openingStock: 120,
        currentStock: 120,
        minStock: 25,
        description: "كرتون يحتوي 5 رزم ممتازة للطباعة",
      },
      {
        code: "PEN-001",
        name: "أقلام جاف روتو أزرق 0.7 مم (باكت 50 قلم)",
        category: pensCat?._id,
        unit: "علبة",
        purchasePrice: 35.0,
        sellingPrice: 48.0,
        openingStock: 45,
        currentStock: 45,
        minStock: 10,
        description: "أقلام زرقاء ناعمة وسريعة الجفاف",
      },
      {
        code: "PEN-002",
        name: "أقلام تظليل هايلايتر باستيل (طقم 6 ألوان)",
        category: pensCat?._id,
        unit: "طقم",
        purchasePrice: 12.0,
        sellingPrice: 18.0,
        openingStock: 60,
        currentStock: 60,
        minStock: 15,
        description: "ألوان هادئة للتركيز والمذاكرة",
      },
      {
        code: "NBK-001",
        name: "دفتر سلك جامعي 200 ورقة مسطر مقسم 5 أقسام",
        category: booksCat?._id,
        unit: "قطعة",
        purchasePrice: 14.0,
        sellingPrice: 22.0,
        openingStock: 80,
        currentStock: 80,
        minStock: 20,
        description: "غلاف مقوى بلاستيكي مقاوم للماء",
      },
      {
        code: "ART-001",
        name: "ألوان خشبية مائية فابر كاستل 24 لون",
        category: artCat?._id,
        unit: "علبة",
        purchasePrice: 32.0,
        sellingPrice: 45.0,
        openingStock: 30,
        currentStock: 30,
        minStock: 8,
        description: "ألوان فنية أصلية للرسم الاحترافي",
      },
      {
        code: "OFC-001",
        name: "دباسة كانجارو معدنية متوسطة مع علبة دبابيس",
        category: officeCat?._id,
        unit: "قطعة",
        purchasePrice: 16.5,
        sellingPrice: 25.0,
        openingStock: 4,
        currentStock: 4,
        minStock: 6, // Low stock test
        description: "دباسة معدنية ثقيلة للمكاتب والمدارس",
      },
    ];

    for (const prod of sampleProducts) {
      if (prod.category) {
        const exists = await Product.findOne({ code: prod.code });
        if (!exists) {
          await Product.create(prod);
        }
      }
    }
    console.log("[Seed] Sample Products ready.");

    // 6. Settings
    let settings = await Setting.findOne();
    if (!settings) {
      await Setting.create({
        storeName: "مكتبة شهد المعارف للقرطاسية والأدوات المكتبية",
        storeAddress: "شارع المعرفة - المملكة العربية السعودية",
        storePhone: "+966500123456",
        currency: "ر.س",
        taxNumber: "300123456700003",
        lowStockThresholdDefault: 5,
        units: ["قطعة", "علبة", "درزن", "رزمة", "كرتون", "حزمة", "طقم", "متر"],
        receiptFooterNote: "نسعد بخدمتكم دائماً في مكتبة شهد المعارف",
      });
      console.log("[Seed] Settings initialized.");
    }

    console.log("[Seed] Database seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("[Seed Error]", err);
    process.exit(1);
  }
};

seedData();
