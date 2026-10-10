import StockMovement from "../models/StockMovement.js";
import Stocktaking from "../models/Stocktaking.js";

export const generateMovementNumber = async (prefix = "MOV") => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const count = await StockMovement.countDocuments();
  return `${prefix}-${dateStr}-${(count + 1).toString().padStart(4, "0")}-${randomSuffix}`;
};

export const generateStocktakeNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await Stocktaking.countDocuments();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `STK-${dateStr}-${(count + 1).toString().padStart(3, "0")}-${randomSuffix}`;
};
