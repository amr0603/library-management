import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

const MEDIA_DIR = "d:/شهد المعارف/library-management/demo-media";

async function recordTour() {
  console.log("جاري تشغيل المتصفح لالتقاط جولة مرئية شاملة للنظام...");
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1400,900"],
    defaultViewport: { width: 1400, height: 900 },
  });

  const page = await browser.newPage();

  // 1. Login Page
  console.log("1. التقاط شاشة الدخول...");
  await page.goto("http://localhost:5173/login", { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(MEDIA_DIR, "01-login.png") });

  // Do Login
  await page.type("input[type=text]", "admin");
  await page.type("input[type=password]", "admin123456");
  await page.click("button[type=submit]");
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  // 2. Dashboard
  console.log("2. التقاط لوحة التحكم...");
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(MEDIA_DIR, "02-dashboard.png") });

  // 3. Products Page
  console.log("3. التقاط دليل المنتجات...");
  await page.goto("http://localhost:5173/products", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(MEDIA_DIR, "03-products.png") });

  // 4. Add Product Form
  console.log("4. التقاط نموذج إضافة صنف...");
  await page.goto("http://localhost:5173/products/new", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(MEDIA_DIR, "04-add-product.png") });

  // 5. Incoming Stock
  console.log("5. التقاط سند الإدخال المخزني...");
  await page.goto("http://localhost:5173/movements/in", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(MEDIA_DIR, "05-incoming-stock.png") });

  // 6. Outgoing Stock
  console.log("6. التقاط سند الإخراج المخزني...");
  await page.goto("http://localhost:5173/movements/out", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(MEDIA_DIR, "06-outgoing-stock.png") });

  // 7. Movements History
  console.log("7. التقاط سجل الحركات والتدقيق...");
  await page.goto("http://localhost:5173/movements", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(MEDIA_DIR, "07-movements-history.png") });

  // 8. Stocktaking
  console.log("8. التقاط شاشة الجرد والتسوية...");
  await page.goto("http://localhost:5173/stocktaking", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(MEDIA_DIR, "08-stocktaking.png") });

  // 9. Low Stock Alerts
  console.log("9. التقاط تنبيهات النواقص...");
  await page.goto("http://localhost:5173/low-stock", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(MEDIA_DIR, "09-low-stock.png") });

  // 10. Reports
  console.log("10. التقاط شاشة التقارير المالية...");
  await page.goto("http://localhost:5173/reports", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(MEDIA_DIR, "10-reports.png") });

  await browser.close();
  console.log("✅ تم التقاط جميع لقطات الشاشة بنجاح!");
}

recordTour().catch(console.error);
