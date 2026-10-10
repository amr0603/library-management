export const errorHandler = (err, req, res, next) => {
  console.error("[Server Error]", err);
  
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "المعرف المطلوب غير صالح" });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(400).json({ success: false, message: `القيمة المدخلة في حقل (${field}) مستخدمة مسبقاً` });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ success: false, message: messages.join(", ") });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "حدث خطأ غير متوقع في الخادم",
  });
};
