import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useApp } from "../context/AppContext";

export default function StocktakingPage() {
  const { settings, showToast } = useApp();
  const [products, setProducts] = useState([]);
  const [stocktakes, setStocktakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [actualStock, setActualStock] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    try {
      const [prodRes, stkRes] = await Promise.all([
        api.get("/products?limit=1000&status=active"),
        api.get("/stocktaking"),
      ]);
      if (prodRes.success) setProducts(prodRes.data);
      if (stkRes.success) setStocktakes(stkRes.data);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedProduct = products.find((p) => p._id === selectedProductId);
  const systemStock = selectedProduct ? selectedProduct.currentStock : 0;
  const actualNum = actualStock !== "" ? Number(actualStock) : null;
  const difference = actualNum !== null ? Number((actualNum - systemStock).toFixed(2)) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (difference === 0) {
      showToast("لا يوجد فرق بين الرصيد الفعلي والدفتري، لا داعي للتسوية", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/stocktaking/adjustment", {
        productId: selectedProductId,
        actualStock: actualNum,
        reason,
        notes,
      });

      if (res.success) {
        showToast(res.message);
        setSelectedProductId("");
        setActualStock("");
        setReason("");
        setNotes("");
        fetchData();
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">⚖️ الجرد الدوري وتسوية فروقات المخزون</h4>
        <p className="text-muted small mb-0">
          مطابقة الرصيد الدفتري المسجل في النظام مع العد الفعلي على أرفف المكتبة وإصدار سندات تسوية رسمية
        </p>
      </div>

      <div className="row g-4">
        {/* Adjustment Form */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">تسجيل عملية جرد وتسوية</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">اختر الصنف المراد جرده *</label>
                <select
                  className="form-select"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                >
                  <option value="">-- اختر المنتج --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.code}) - الرصيد الدفتري: {p.currentStock} {p.unit}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">الرصيد الدفتري بالنظام:</span>
                    <strong className="fs-6">{systemStock} {selectedProduct.unit}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">تكلفة الشراء للوحدة:</span>
                    <span>{selectedProduct.purchasePrice} {settings?.currency || "ر.س"}</span>
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-bold">الكمية الفعلية المحصورة بالعد *</label>
                <div className="input-group">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    placeholder="أدخل ناتج الجرد الفعلي"
                    value={actualStock}
                    onChange={(e) => setActualStock(e.target.value)}
                    required
                    disabled={!selectedProductId}
                  />
                  <span className="input-group-text">{selectedProduct?.unit || "وحدة"}</span>
                </div>
              </div>

              {actualNum !== null && selectedProduct && (
                <div
                  className={`alert ${
                    difference > 0
                      ? "alert-info"
                      : difference < 0
                      ? "alert-warning"
                      : "alert-success"
                  } py-2 mb-3`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      {difference > 0
                        ? "📈 زيادة وفائض جردي:"
                        : difference < 0
                        ? "📉 عجز ونقص جردي:"
                        : "✅ الرصيد مطابق تماماً:"}
                    </span>
                    <strong className="fs-6">
                      {Math.abs(difference)} {selectedProduct.unit}
                    </strong>
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-bold">سبب التسوية الجردية *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="مثال: خطأ في العد السابق، كسر، بضاعة زائدة من المورد"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  disabled={!selectedProductId}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">ملاحظات إضافية</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!selectedProductId}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold py-2"
                disabled={loading || !selectedProductId || actualNum === null || difference === 0}
              >
                {loading ? "جاري ترحيل التسوية..." : "اعتماد التسوية وتعديل الرصيد"}
              </button>
            </form>
          </div>
        </div>

        {/* Adjustments History */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">سجل عمليات الجرد والتسويات السابقة</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>رقم الجرد</th>
                    <th>التاريخ</th>
                    <th>الصنف</th>
                    <th>الدفتري</th>
                    <th>الفعلي</th>
                    <th>الفرق</th>
                    <th>السبب</th>
                  </tr>
                </thead>
                <tbody>
                  {stocktakes.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        لا توجد تسويات جردية مسجلة حتى الآن
                      </td>
                    </tr>
                  ) : (
                    stocktakes.map((s) => (
                      <tr key={s._id}>
                        <td className="font-monospace fw-bold small">{s.stocktakeNumber}</td>
                        <td className="small text-muted">{new Date(s.date).toLocaleDateString("ar-SA")}</td>
                        <td className="fw-semibold">{s.product?.name}</td>
                        <td>{s.systemStock}</td>
                        <td className="fw-bold">{s.actualStock}</td>
                        <td>
                          <span className={`badge ${s.difference > 0 ? "bg-info" : "bg-warning text-dark"}`}>
                            {s.difference > 0 ? `+${s.difference}` : s.difference}
                          </span>
                        </td>
                        <td className="small text-muted">{s.reason}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
