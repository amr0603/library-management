import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useApp } from "../context/AppContext";

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { settings, showToast } = useApp();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    unit: "قطعة",
    purchasePrice: 0,
    sellingPrice: 0,
    openingStock: 0,
    minStock: 5,
    description: "",
  });
  const [currentStock, setCurrentStock] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await api.get("/categories");
        if (catRes.success) setCategories(catRes.data);

        if (isEdit) {
          const prodRes = await api.get(`/products/${id}`);
          if (prodRes.success && prodRes.data) {
            const p = prodRes.data;
            setFormData({
              code: p.code,
              name: p.name,
              category: p.category?._id || p.category,
              unit: p.unit,
              purchasePrice: p.purchasePrice,
              sellingPrice: p.sellingPrice,
              openingStock: p.openingStock,
              minStock: p.minStock,
              description: p.description || "",
            });
            setCurrentStock(p.currentStock);
          }
        }
      } catch (err) {
        showToast(err.message, "error");
      }
    };
    init();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.patch(`/products/${id}`, formData);
        showToast("تم تحديث بيانات المنتج بنجاح");
      } else {
        await api.post("/products", formData);
        showToast("تمت إضافة المنتج الجديد بنجاح");
      }
      navigate("/products");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            {isEdit ? "✏️ تعديل بيانات صنف" : "➕ تسجيل صنف جديد في المخزن"}
          </h4>
          <p className="text-muted small mb-0">
            {isEdit
              ? "ملاحظة: لا يمكن تعديل الرصيد الحالي يدوياً، يتم التعديل فقط عبر حركات الإدخال والصرف أو التسوية"
              : "يرجى تعبئة كافة الحقول المطلوبة لضمان سلامة العمليات المحاسبية والمخزنية"}
          </p>
        </div>
        <Link to="/products" className="btn btn-outline-secondary">
          عودة للقائمة &larr;
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">كود المنتج (الباركود / الرمز الداخلي) *</label>
              <input
                type="text"
                name="code"
                className="form-control font-monospace"
                placeholder="مثال: PEN-101"
                value={formData.code}
                onChange={handleChange}
                required
              />
              <small className="text-muted">يجب أن يكون فريداً وغير مكرر</small>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">اسم المنتج والمواصفات *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="مثال: أقلام جاف روتو أزرق"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">تصنيف الصنف *</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">-- اختر التصنيف --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">وحدة القياس المخزنية *</label>
              <select
                name="unit"
                className="form-select"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                {settings?.units?.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">سعر الشراء (التكلفة) *</label>
              <div className="input-group">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="purchasePrice"
                  className="form-control"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  required
                />
                <span className="input-group-text">{settings?.currency || "ر.س"}</span>
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">سعر البيع المقترح *</label>
              <div className="input-group">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="sellingPrice"
                  className="form-control"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  required
                />
                <span className="input-group-text">{settings?.currency || "ر.س"}</span>
              </div>
            </div>

            {!isEdit ? (
              <div className="col-md-6">
                <label className="form-label fw-bold">الرصيد الافتتاحي الأولي</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="openingStock"
                  className="form-control"
                  value={formData.openingStock}
                  onChange={handleChange}
                />
                <small className="text-muted">الكمية المتوفرة حالياً في الرف لحظة بدء إدخال الصنف</small>
              </div>
            ) : (
              <div className="col-md-6">
                <label className="form-label fw-bold">الرصيد الفعلي الحالي</label>
                <input
                  type="text"
                  className="form-control bg-light fw-bold text-primary"
                  value={`${currentStock} ${formData.unit}`}
                  disabled
                />
                <small className="text-muted">محمي ومحسوب تلقائياً من حركات المخزن</small>
              </div>
            )}

            <div className="col-md-6">
              <label className="form-label fw-bold">حد الطلب الأدنى (تنبيه النواقص) *</label>
              <input
                type="number"
                step="1"
                min="0"
                name="minStock"
                className="form-control"
                value={formData.minStock}
                onChange={handleChange}
                required
              />
              <small className="text-muted">يتم التنبيه عند وصول الرصيد إلى هذا الحد أو أقل</small>
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">وصف إضافي وملاحظات</label>
              <textarea
                name="description"
                rows="3"
                className="form-control"
                placeholder="أي تفاصيل أو ماركة أو رقم الرف والموقع في المستودع..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <Link to="/products" className="btn btn-secondary px-4">
              إلغاء
            </Link>
            <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={loading}>
              {loading ? "جاري الحفظ..." : isEdit ? "تحديث بيانات الصنف" : "حفظ الصنف الجديد"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
