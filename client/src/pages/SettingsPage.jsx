import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useApp } from "../context/AppContext";

export default function SettingsPage() {
  const { settings, fetchSettings, showToast } = useApp();
  const [formData, setFormData] = useState({
    storeName: "",
    storeAddress: "",
    storePhone: "",
    currency: "ر.س",
    taxNumber: "",
    lowStockThresholdDefault: 5,
    receiptFooterNote: "",
  });
  const [unitsInput, setUnitsInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || "",
        storeAddress: settings.storeAddress || "",
        storePhone: settings.storePhone || "",
        currency: settings.currency || "ر.س",
        taxNumber: settings.taxNumber || "",
        lowStockThresholdDefault: settings.lowStockThresholdDefault || 5,
        receiptFooterNote: settings.receiptFooterNote || "",
      });
      setUnitsInput(settings.units ? settings.units.join(", ") : "");
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const unitsArray = unitsInput
        .split(",")
        .map((u) => u.trim())
        .filter((u) => u.length > 0);

      const res = await api.put("/settings", {
        ...formData,
        units: unitsArray,
      });

      if (res.success) {
        showToast("تم تحديث وحفظ إعدادات النظام بنجاح");
        fetchSettings();
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">⚙️ إعدادات النظام والمكتبة</h4>
        <p className="text-muted small mb-0">بيانات المتجر الرسمية، العملة، الوحدات المعتمدة وقوالب الطباعة</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">اسم المكتبة / المتجر *</label>
              <input
                type="text"
                className="form-control"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">العملة الافتراضية *</label>
              <input
                type="text"
                className="form-control"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="مثال: ر.س أو ج.م"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">رقم الهاتف للتواصل</label>
              <input
                type="text"
                className="form-control"
                value={formData.storePhone}
                onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">الرقم الضريبي (إن وجد)</label>
              <input
                type="text"
                className="form-control"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">عنوان ومقر المكتبة</label>
              <input
                type="text"
                className="form-control"
                value={formData.storeAddress}
                onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">وحدات القياس المخزنية المتاحة (مفصولة بفاصلة)</label>
              <input
                type="text"
                className="form-control"
                value={unitsInput}
                onChange={(e) => setUnitsInput(e.target.value)}
                placeholder="قطعة, علبة, درزن, رزمة, كرتون, طقم"
              />
              <small className="text-muted">تظهر هذه الوحدات في قوائم خيارات المنتجات</small>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">الحد الأدنى الافتراضي لتنبيه النواقص</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={formData.lowStockThresholdDefault}
                onChange={(e) => setFormData({ ...formData, lowStockThresholdDefault: e.target.value })}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">النص التذييلي في الإيصالات وسندات الطباعة</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.receiptFooterNote}
                onChange={(e) => setFormData({ ...formData, receiptFooterNote: e.target.value })}
              ></textarea>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4 pt-3 border-top">
            <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ التغييرات والإعدادات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
