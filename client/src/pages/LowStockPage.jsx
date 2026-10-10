import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useApp } from "../context/AppContext";
import * as XLSX from "xlsx";

export default function LowStockPage() {
  const { settings, showToast } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products?lowStock=true&limit=1000&status=active");
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStock();
  }, []);

  const exportExcel = () => {
    const data = products.map((p) => ({
      "كود المنتج": p.code,
      "اسم المنتج": p.name,
      "التصنيف": p.category?.name || "",
      "الرصيد المتبقي": p.currentStock,
      "حد الطلب الأدنى": p.minStock,
      "العجز عن حد الطلب": Math.max(0, p.minStock - p.currentStock),
      "الوحدة": p.unit,
      "سعر الشراء": p.purchasePrice,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "نواقص المخزون");
    XLSX.writeFile(wb, `نواقص-المخزون-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-danger mb-1">⚠️ تنبيهات الأصناف الناقصة والمنخفضة المخزون</h4>
          <p className="text-muted small mb-0">
            قائمة بجميع المنتجات التي وصل رصيدها إلى حد الطلب الأدنى أو أقل ويجب توريدها فوراً
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success shadow-sm" onClick={exportExcel}>
            📊 تصدير قائمة النواقص Excel
          </button>
          <button className="btn btn-outline-dark shadow-sm" onClick={() => window.print()}>
            🖨️ طباعة
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>كود الصنف</th>
                <th>اسم المنتج</th>
                <th>التصنيف</th>
                <th>الرصيد الفعلي الحالي</th>
                <th>حد الطلب الأدنى</th>
                <th>مقدار النقص والعجز</th>
                <th>سعر التكلفة</th>
                <th className="text-center">إجراء توريد</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border text-danger" role="status"></div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    🎉 لا توجد أصناف تحت حد الطلب حالياً. المخزون في حالة ممتازة!
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const deficit = Math.max(0, p.minStock - p.currentStock);
                  return (
                    <tr key={p._id}>
                      <td className="font-monospace fw-bold">{p.code}</td>
                      <td>
                        <div className="fw-bold text-dark">{p.name}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {p.category?.name || "بدون تصنيف"}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-danger fs-6">
                          {p.currentStock} {p.unit}
                        </span>
                      </td>
                      <td className="fw-semibold">
                        {p.minStock} {p.unit}
                      </td>
                      <td>
                        <span className="badge bg-warning text-dark fw-bold">
                          نقص {deficit} {p.unit}
                        </span>
                      </td>
                      <td>{p.purchasePrice} {settings?.currency || "ر.س"}</td>
                      <td className="text-center">
                        <Link
                          to={`/movements/in?productId=${p._id}`}
                          className="btn btn-sm btn-success fw-bold"
                        >
                          📥 تسجيل توريد (وارد)
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
