import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useApp } from "../context/AppContext";

export default function OutgoingStockPage() {
  const [searchParams] = useSearchParams();
  const preSelectedProduct = searchParams.get("productId") || "";
  const navigate = useNavigate();
  const { settings, showToast } = useApp();

  const [products, setProducts] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);

  const [formData, setFormData] = useState({
    productId: preSelectedProduct,
    quantity: "",
    recipient: "",
    reason: "sale",
    reference: "",
    notes: "",
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, recRes] = await Promise.all([
          api.get("/products?limit=1000&status=active"),
          api.get("/recipients"),
        ]);
        if (prodRes.success) setProducts(prodRes.data);
        if (recRes.success) setRecipients(recRes.data);
      } catch (err) {
        showToast(err.message, "error");
      }
    };
    fetchData();
  }, []);

  const selectedProduct = products.find((p) => p._id === formData.productId);

  const reasons = [
    { value: "sale", label: "بيع للعميل" },
    { value: "internal_use", label: "استخدام واستهلاك داخلي بالمكتبة" },
    { value: "distribution", label: "صرف وتوزيع للأقسام / الفروع" },
    { value: "damaged", label: "بضاعة تالفة أو منتهية الصلاحية" },
    { value: "supplier_return", label: "مرتجع للمورد" },
    { value: "other", label: "سبب آخر" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/movements/out", formData);
      if (res.success) {
        showToast(res.message);
        setSuccessReceipt(res.data);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const requestedQty = Number(formData.quantity) || 0;
  const isOverLimit = selectedProduct && requestedQty > selectedProduct.currentStock;

  return (
    <div style={{ maxWidth: "850px", margin: "0 auto" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">📤 سند إخراج مخزني (صرف / مبيعات)</h4>
          <p className="text-muted small mb-0">خصم من رصيد المستودع مع التحقق الصارم من عدم حدوث رصيد سالب</p>
        </div>
      </div>

      {successReceipt ? (
        <div className="card border-0 shadow rounded-4 p-4 bg-white">
          <div className="alert alert-success text-center py-3 mb-4">
            <h5 className="fw-bold mb-1">✅ تم صرف وإخراج الكمية بنجاح من المخزن!</h5>
            <p className="mb-0 font-monospace">رقم السند: {successReceipt.movementNumber}</p>
          </div>

          <div id="printable-receipt" className="border rounded-3 p-4 bg-light mb-4">
            <div className="text-center border-bottom pb-3 mb-3">
              <h4 className="fw-bold text-dark mb-1">{settings?.storeName || "مكتبة شهد المعارف"}</h4>
              <h6 className="text-muted">إيصال سند إخراج مخزني رسمي</h6>
              <div className="small text-muted font-monospace">رقم السند: {successReceipt.movementNumber}</div>
              <div className="small text-muted">التاريخ: {new Date(successReceipt.date).toLocaleString("ar-SA")}</div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <strong>الصنف:</strong> {selectedProduct?.name} ({selectedProduct?.code})
              </div>
              <div className="col-6">
                <strong>الكمية المنصرفة:</strong> {successReceipt.quantity} {selectedProduct?.unit}
              </div>
              <div className="col-6">
                <strong>سبب الصرف:</strong> {reasons.find((r) => r.value === successReceipt.reason)?.label || successReceipt.reason}
              </div>
              <div className="col-6">
                <strong>تكلفة الوحدة:</strong> {successReceipt.unitPrice} {settings?.currency || "ر.س"}
              </div>
              <div className="col-6">
                <strong>الرصيد قبل الصرف:</strong> {successReceipt.stockBefore} {selectedProduct?.unit}
              </div>
              <div className="col-6">
                <strong>الرصيد المتبقي بعد الصرف:</strong> {successReceipt.stockAfter} {selectedProduct?.unit}
              </div>
              {successReceipt.reference && (
                <div className="col-12">
                  <strong>رقم الإذن / المرجع:</strong> {successReceipt.reference}
                </div>
              )}
              {successReceipt.notes && (
                <div className="col-12">
                  <strong>ملاحظات:</strong> {successReceipt.notes}
                </div>
              )}
            </div>

            <div className="text-center border-top pt-3 text-muted small">
              {settings?.receiptFooterNote || "شكراً لتعاملكم مع مكتبة شهد المعارف"}
            </div>
          </div>

          <div className="d-flex justify-content-between">
            <button
              className="btn btn-primary fw-bold"
              onClick={() => {
                setSuccessReceipt(null);
                setFormData({
                  productId: "",
                  quantity: "",
                  recipient: "",
                  reason: "sale",
                  reference: "",
                  notes: "",
                  date: new Date().toISOString().slice(0, 10),
                });
              }}
            >
              ➕ إخراج سند جديد
            </button>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-dark fw-bold" onClick={printReceipt}>
                🖨️ طباعة الإيصال
              </button>
              <button className="btn btn-outline-secondary" onClick={() => navigate("/movements")}>
                عرض سجل الحركات
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">اختر الصنف المراد صرفه *</label>
                <select
                  className="form-select"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  required
                >
                  <option value="">-- اختر من قائمة المنتجات المتاحة --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id} disabled={p.currentStock <= 0}>
                      {p.name} ({p.code}) - الرصيد المتاح: {p.currentStock} {p.unit}{" "}
                      {p.currentStock <= 0 ? "(رصيد نافد)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">سبب الصرف والإخراج *</label>
                <select
                  className="form-select"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                >
                  {reasons.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">الجهة المستلمة أو العميل (اختياري)</label>
                <select
                  className="form-select"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                >
                  <option value="">-- بدون تحديد جهة مستلمة --</option>
                  {recipients.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.type === "department" ? "قسم داخلي" : "عميل"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">الكمية المراد صرفها *</label>
                <div className="input-group">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedProduct ? selectedProduct.currentStock : undefined}
                    className={`form-control ${isOverLimit ? "is-invalid" : ""}`}
                    placeholder="مثال: 10"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                  <span className="input-group-text">{selectedProduct?.unit || "وحدة"}</span>
                </div>
                {isOverLimit && (
                  <div className="text-danger small mt-1 fw-bold">
                    ⚠️ الكمية المطلوبة تتجاوز الرصيد المتاح بالمستودع!
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">تاريخ السند</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">رقم الإذن أو الفاتورة</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="مثال: REQ-045"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-bold">ملاحظات</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="أي تفاصيل أو ملاحظات حول الصرف..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>
            </div>

            {selectedProduct && (
              <div
                className={`alert ${
                  isOverLimit ? "alert-danger" : "alert-warning"
                } mt-4 py-2 small d-flex justify-content-between align-items-center`}
              >
                <span>
                  الرصيد الحالي: <strong>{selectedProduct.currentStock} {selectedProduct.unit}</strong>
                </span>
                <span>
                  الرصيد المتبقي بعد الصرف:{" "}
                  <strong className={isOverLimit ? "text-danger" : "text-dark"}>
                    {(Number(selectedProduct.currentStock) - requestedQty).toFixed(2)}{" "}
                    {selectedProduct.unit}
                  </strong>
                </span>
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/products")}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="btn btn-danger px-4 fw-bold"
                disabled={loading || !formData.productId || isOverLimit || requestedQty <= 0}
              >
                {loading ? "جاري الخصم والاعتماد..." : "📤 اعتماد وترحيل سند الصرف"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
