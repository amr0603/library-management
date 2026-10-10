import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../src/config/db.js";
import User from "../src/models/User.js";
import Category from "../src/models/Category.js";
import Product from "../src/models/Product.js";
import Supplier from "../src/models/Supplier.js";
import Recipient from "../src/models/Recipient.js";
import StockMovement from "../src/models/StockMovement.js";
import Stocktaking from "../src/models/Stocktaking.js";
import { generateMovementNumber, generateStocktakeNumber } from "../src/utils/numberGenerator.js";

const runDemoSeed = async () => {
  try {
    await connectDB();
    console.log("[Demo] جاري إعداد بيانات العرض التوضيحي (Demo)...");

    // 1. تنظيف المنتجات والحركات السابقة
    await StockMovement.deleteMany({});
    await Stocktaking.deleteMany({});
    await Product.deleteMany({});

    const admin = await User.findOne({ username: "admin" });
    const emp = await User.findOne({ username: "employee" });

    // التصنيفات
    const catPens = await Category.findOne({ name: "أقلام ومحابر" });
    const catPaper = await Category.findOne({ name: "ورق وطباعة" });
    const catBooks = await Category.findOne({ name: "دفاتر وكشاكيل" });
    const catOffice = await Category.findOne({ name: "أدوات مكتبية عامة" });
    const catArt = await Category.findOne({ name: "أدوات فنية ورسم" });

    // الموردين والجهات المستلمة
    const supAhram = await Supplier.findOne({ name: { $regex: "الأهرام" } });
    const supRowad = await Supplier.findOne({ name: { $regex: "الرواد" } });
    const recSchool = await Recipient.findOne({ name: { $regex: "الأمل" } });
    const recDept = await Recipient.findOne({ name: { $regex: "المحاسبة" } });

    // 2. إنشاء أصناف ديمو حقيقية ومتنوعة
    const p1 = await Product.create({
      code: "PAP-001",
      name: "ورق تصوير Double A مقاس A4 وزن 80 جم (كرتون 5 رزم)",
      category: catPaper._id,
      unit: "كرتون",
      purchasePrice: 95.0,
      sellingPrice: 125.0,
      openingStock: 30,
      currentStock: 30,
      minStock: 10,
      description: "ورق طباعة ليزر عالي الجودة خالي من الأحماض",
    });

    const p2 = await Product.create({
      code: "PEN-101",
      name: "أقلام جاف روتو أزرق 0.7 مم (علبة 50 قلم)",
      category: catPens._id,
      unit: "علبة",
      purchasePrice: 42.0,
      sellingPrice: 60.0,
      openingStock: 25,
      currentStock: 25,
      minStock: 8,
      description: "حبر سائل سريع الجفاف انسيابي بالكتابة",
    });

    const p3 = await Product.create({
      code: "PEN-202",
      name: "أقلام تظليل هايلايتر باستيل (طقم 6 ألوان زاهية)",
      category: catPens._id,
      unit: "طقم",
      purchasePrice: 14.5,
      sellingPrice: 22.0,
      openingStock: 50,
      currentStock: 50,
      minStock: 15,
      description: "ألوان باستيل ناعمة ومريحة للعين للمذاكرة",
    });

    const p4 = await Product.create({
      code: "NBK-301",
      name: "دفتر سلك جامعي 200 ورقة مسطر مقسم 5 مواضيع",
      category: catBooks._id,
      unit: "قطعة",
      purchasePrice: 16.0,
      sellingPrice: 25.0,
      openingStock: 40,
      currentStock: 40,
      minStock: 12,
      description: "غلاف بلاستيكي مقوى مع فواصل ملونة",
    });

    const p5 = await Product.create({
      code: "OFC-401",
      name: "دباسة كانجارو معدنية متوسطة الحجم مع علبة دبابيس",
      category: catOffice._id,
      unit: "قطعة",
      purchasePrice: 18.0,
      sellingPrice: 28.0,
      openingStock: 5, // تحت حد الطلب لتجربة تنبيه النواقص
      currentStock: 5,
      minStock: 8,
      description: "دباسة معدنية ثقيلة للمكاتب والمدارس",
    });

    const p6 = await Product.create({
      code: "ART-501",
      name: "ألوان خشبية فابر كاستل مائية احترافية (علبة 24 لون)",
      category: catArt._id,
      unit: "علبة",
      purchasePrice: 38.0,
      sellingPrice: 55.0,
      openingStock: 15,
      currentStock: 15,
      minStock: 5,
      description: "ألوان خشبية ناعمة قابلة للدمج بالماء مع ريشة",
    });

    console.log("[Demo] تم إنشاء 6 أصناف قرطاسية نموذجية.");

    // 3. إنشاء حركات إدخال مخزني (توريد) مع تواريخ سابقة لتغذية الرسم البياني
    const createIn = async (prod, qty, price, daysAgo, sup, ref, notes) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      const movNum = await generateMovementNumber("IN");
      const before = prod.currentStock;
      const after = before + qty;

      await StockMovement.create({
        movementNumber: movNum,
        product: prod._id,
        type: "IN",
        quantity: qty,
        unitPrice: price,
        totalValue: qty * price,
        date: d,
        supplier: sup?._id,
        reason: "purchase",
        reference: ref,
        notes: notes,
        stockBefore: before,
        stockAfter: after,
        createdBy: admin._id,
      });

      prod.currentStock = after;
      await prod.save();
    };

    // 4. إنشاء حركات صرف (صادر)
    const createOut = async (prod, qty, daysAgo, rec, reason, ref, notes) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      const movNum = await generateMovementNumber("OUT");
      const before = prod.currentStock;
      const after = before - qty;

      await StockMovement.create({
        movementNumber: movNum,
        product: prod._id,
        type: "OUT",
        quantity: qty,
        unitPrice: prod.purchasePrice,
        totalValue: qty * prod.purchasePrice,
        date: d,
        recipient: rec?._id,
        reason: reason,
        reference: ref,
        notes: notes,
        stockBefore: before,
        stockAfter: after,
        createdBy: emp._id,
      });

      prod.currentStock = after;
      await prod.save();
    };

    // تنفيذ الحركات عبر الأيام السابقة لإظهار المخططات والإحصائيات
    await createIn(p1, 20, 95.0, 5, supRowad, "INV-7801", "توريد شحنة ورق تصوير من مؤسسة الرواد");
    await createIn(p2, 30, 42.0, 4, supAhram, "INV-7802", "شحنة أقلام روتو جاف أزرق");
    await createOut(p1, 15, 3, recSchool, "sale", "INV-OUT-101", "صرف ورق تصوير لمدرسة الأمل النموذجية");
    await createOut(p2, 10, 2, recSchool, "sale", "INV-OUT-102", "أقلام جاف لمدرسة الأمل");
    await createIn(p3, 25, 14.5, 2, supAhram, "INV-7803", "توريد أطقم هايلايتر باستيل");
    await createOut(p4, 12, 1, recDept, "internal_use", "REQ-012", "صرف دفاتر لقسم المحاسبة والإدارة");
    await createOut(p5, 2, 0, null, "damaged", "DMG-001", "استبعاد دباستين تالفتين أثناء الفحص");

    // 5. إنشاء تسوية جردية نموذجية
    const stocktakeNumber = await generateStocktakeNumber();
    const adjMovNum = await generateMovementNumber("ADJ-IN");
    const p6Before = p6.currentStock;
    const p6Actual = 18; // زيادة قطعتين

    const adjMov = await StockMovement.create({
      movementNumber: adjMovNum,
      product: p6._id,
      type: "ADJUSTMENT_IN",
      quantity: 3,
      unitPrice: p6.purchasePrice,
      totalValue: 3 * p6.purchasePrice,
      reason: "stocktake_surplus",
      reference: `تسوية جردية: ${stocktakeNumber}`,
      notes: "تسوية فائض جرد: وجود 3 علب ألوان إضافية لم تُقيد بالفاتورة السابقة",
      stockBefore: p6Before,
      stockAfter: p6Actual,
      createdBy: admin._id,
    });

    p6.currentStock = p6Actual;
    await p6.save();

    await Stocktaking.create({
      stocktakeNumber,
      product: p6._id,
      systemStock: p6Before,
      actualStock: p6Actual,
      difference: 3,
      reason: "وجود 3 علب ألوان إضافية غير مقيدة",
      notes: "تم المطابقة والاعتماد من أمين المستودع",
      createdBy: admin._id,
      movement: adjMov._id,
    });

    console.log("✅ تم إعداد بيانات الديمو المتكاملة بنجاح!");
    process.exit(0);
  } catch (err) {
    console.error("[Demo Error]", err);
    process.exit(1);
  }
};

runDemoSeed();
