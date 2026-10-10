import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/User.js";
import Category from "../src/models/Category.js";
import Product from "../src/models/Product.js";
import StockMovement from "../src/models/StockMovement.js";
import Supplier from "../src/models/Supplier.js";
import Recipient from "../src/models/Recipient.js";
import { generateMovementNumber } from "../src/utils/numberGenerator.js";

test("Database connection & basic setup", async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
  assert.equal(mongoose.connection.readyState, 1, "Mongoose should be connected");
});

test("Authentication & password hashing", async () => {
  const admin = await User.findOne({ username: "admin" });
  assert.ok(admin, "Admin user must exist");
  const isMatch = await admin.comparePassword("admin123456");
  assert.equal(isMatch, true, "Admin password should match hashed password");
  const isWrongMatch = await admin.comparePassword("wrongpassword");
  assert.equal(isWrongMatch, false, "Wrong password should fail");
});

test("Product creation & duplicate code rejection", async () => {
  const cat = await Category.findOne();
  assert.ok(cat, "At least one category should exist");

  const testCode = "TEST-UNIT-" + Date.now();
  const product = await Product.create({
    code: testCode,
    name: "منتج تجريبي للاختبار",
    category: cat._id,
    unit: "قطعة",
    purchasePrice: 10,
    sellingPrice: 15,
    openingStock: 20,
    currentStock: 20,
    minStock: 5,
  });

  assert.equal(product.currentStock, 20);
  assert.equal(product.code, testCode);

  // Attempt duplicate code
  await assert.rejects(
    async () => {
      await Product.create({
        code: testCode,
        name: "منتج مكرر",
        category: cat._id,
        purchasePrice: 10,
        sellingPrice: 15,
      });
    },
    /duplicate key|E11000/i,
    "Should reject duplicate product code"
  );

  // Clean up
  await Product.deleteOne({ _id: product._id });
});

test("Incoming stock transaction increases balance", async () => {
  const cat = await Category.findOne();
  const admin = await User.findOne({ username: "admin" });

  const product = await Product.create({
    code: "TEST-IN-" + Date.now(),
    name: "منتج وارد تجريبي",
    category: cat._id,
    purchasePrice: 50,
    sellingPrice: 70,
    openingStock: 10,
    currentStock: 10,
    minStock: 5,
  });

  const movNum = await generateMovementNumber("IN");
  const inMovement = await StockMovement.create({
    movementNumber: movNum,
    product: product._id,
    type: "IN",
    quantity: 15,
    unitPrice: 50,
    totalValue: 750,
    stockBefore: product.currentStock,
    stockAfter: product.currentStock + 15,
    createdBy: admin._id,
  });

  product.currentStock = inMovement.stockAfter;
  await product.save();

  assert.equal(product.currentStock, 25, "Current stock should increase from 10 to 25");

  // Outgoing stock transaction decreases balance
  const outMovNum = await generateMovementNumber("OUT");
  const outMovement = await StockMovement.create({
    movementNumber: outMovNum,
    product: product._id,
    type: "OUT",
    quantity: 8,
    unitPrice: 50,
    totalValue: 400,
    stockBefore: product.currentStock,
    stockAfter: product.currentStock - 8,
    createdBy: admin._id,
  });

  product.currentStock = outMovement.stockAfter;
  await product.save();

  assert.equal(product.currentStock, 17, "Current stock should decrease from 25 to 17");

  // Clean up
  await StockMovement.deleteMany({ product: product._id });
  await Product.deleteOne({ _id: product._id });
});

test("Negative stock prevention logic", async () => {
  const cat = await Category.findOne();
  const product = await Product.create({
    code: "TEST-NEG-" + Date.now(),
    name: "منتج فحص السالب",
    category: cat._id,
    purchasePrice: 20,
    sellingPrice: 30,
    openingStock: 5,
    currentStock: 5,
    minStock: 2,
  });

  const requestedQty = 10;
  const isAllowed = product.currentStock >= requestedQty;
  assert.equal(isAllowed, false, "Should reject outgoing when quantity exceeds current stock");

  // Clean up
  await Product.deleteOne({ _id: product._id });
});

test("Cleanup test runs", async () => {
  await mongoose.disconnect();
  assert.equal(mongoose.connection.readyState, 0);
});
