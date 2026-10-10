import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useApp } from "../context/AppContext";

export default function IncomingStockPage() {
  const [searchParams] = useSearchParams();
  const preSelectedProduct = searchParams.get("productId") || "";
  const navigate = useNavigate();
  const { settings, showToast } = useApp();

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);

  const [formData, setFormData] = useState({
    productId: preSelectedProduct,
    quantity: "",
    unitPrice: "",
    supplier: "",
    reference: "",
    notes: "",
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, supRes] = await Promise.all([
          api.get("/products?limit=1000&status=active"),
          api.get("/suppliers"),
        ]);
        if (prodRes.success) setProducts(prodRes.data);
        if (supRes.success) setSuppliers(supRes.data);
      } catch (err) {
        showToast(err.message, "error");
      }
    };
    fetchData();
  }, []);

  const selectedProduct = products.find((p) => p._id === formData.productId);

  const handleProductChange = (e) => {
    const pid = e.target.value;
    const prod = products.find((p) => p._id === pid);
    setFormData((prev) => ({
      ...prev,
      productId: pid,
      unitPrice: prod ? prod.purchasePrice : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/movements/in", formData);
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

  return (
    <div style={{ maxWidth: "850px", margin: "0 auto" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">📥 سند إدخال مخزني (توريد / وارد)</h4>
          <p className="text-muted small mb-0">زيادة رصيد المستودع وتوثيق تكلفة الشراء والمورد</p>
        </div>
      </div>

      {successReceipt ? (
        <div className="card border-0 shadow rounded-4 p-4 bg-white">
          <div className="alert alert-success text-center py-3 mb-4">
            <h5 className="fw-bold mb-1">✅ تم تسجيل وتأكيد سند الإدخال المخزني بنجاح!</h5>
            <p className="mb-0 font-monospace">رقم السند: {successReceipt.movementNumber}</p>
          </div>

          <div id="printable-receipt" className="border rounded-3 p-4 bg-light mb-4">
            <div className="text-center border-bottom pb-3 mb-3">
              <h4 className="fw-bold text-dark mb-1">{settings?.storeName || "مكتبة شهد المعارف"}</h4>
              <h6 className="text-muted">إيصال سند إدخال مخزني رسمي</h6>
              <div className="small text-muted font-monospace">رقم السند: {successReceipt.movementNumber}</div>
              <div className="small text-muted">التاريخ: {new Date(successReceipt.date).toLocaleString("ar-SA")}</div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <strong>الصنف:</strong> {selectedProduct?.name} ({selectedProduct?.code})
              </div>
              <div className="col-6">
                <strong>الكمية الواردة:</strong> {successReceipt.quantity} {selectedProduct?.unit}
              </div>
              <div className="col-6">
                <strong>سعر الوحدة:</strong> {successReceipt.unitPrice} {settings?.currency || "ر.س"}
              </div>
              <div className="col-6">
                <strong>إجمالي القيمة:</strong> {successReceipt.totalValue} {settings?.currency || "ر.س"}
              </div>
              <div className="col-6">
                <strong>الرصيد السابق:</strong> {successReceipt.stockBefore} {selectedProduct?.unit}
              </div>
              <div className="col-6">
                <strong>الرصيد الجديد بالمخزن:</strong> {successReceipt.stockAfter} {selectedProduct?.unit}
              </div>
              {successReceipt.reference && (
                <div className="col-12">
                  <strong>رقم الفاتورة / المرجع:</strong> {successReceipt.reference}
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
                  unitPrice: "",
                  supplier: "",
                  reference: "",
                  notes: "",
                  date: new Date().toISOString().slice(0, 10),
                });
              }}
            >
              ➕ إدخال سند جديد
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
                <label className="form-label fw-bold">اختر الصنف المراد توريده *</label>
                <select
                  className="form-select"
                  value={formData.productId}
                  onChange={handleProductChange}
                  required
                >
                  <option value="">-- اختر من قائمة المنتجات --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.code}) - الرصيد الحالي: {p.currentStock} {p.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">المورد (اختياري)</label>
                <select
                  className="form-select"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                >
                  <option value="">-- بدون مورد محدد --</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">الكمية الواردة *</label>
                <div className="input-group">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    placeholder="مثال: 50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                  <span className="input-group-text">{selectedProduct?.unit || "وحدة"}</span>
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">سعر الشراء للوحدة *</label>
                <div className="input-group">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    required
                  />
                  <span className="input-group-text">{settings?.currency || "ر.س"}</span>
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">إجمالي قيمة التوريد</label>
                <input
                  type="text"
                  className="form-control bg-light fw-bold text-success"
                  value={`${(
                    (Number(formData.quantity) || 0) * (Number(formData.unitPrice) || 0)
                  ).toFixed(2)} ${settings?.currency || "ر.س"}`}
                  disabled
                />
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
                <label className="form-label fw-bold">رقم الفاتورة أو المرجع</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="مثال: INV-2026-99"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-bold">ملاحظات إضافية</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="أي ملاحظات حول التوريد أو حالة البضاعة..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>
            </div>

            {selectedProduct && (
              <div className="alert alert-info mt-4 py-2 small d-flex justify-content-between align-items-center">
                <span>
                  الرصيد الحالي: <strong>{selectedProduct.currentStock} {selectedProduct.unit}</strong>
                </span>
                <span>
                  الرصيد المتوقع بعد الإدخال:{" "}
                  <strong className="text-success fs-6">
                    {(Number(selectedProduct.currentStock) + (Number(formData.quantity) || 0)).toFixed(2)}{" "}
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
                className="btn btn-success px-4 fw-bold"
                disabled={loading || !formData.productId}
              >
                {loading ? "جاري الحفظ والاعتماد..." : "📥 اعتماد وترحيل سند الإدخال"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
