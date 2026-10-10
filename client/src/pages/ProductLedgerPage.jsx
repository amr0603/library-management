import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useApp } from "../context/AppContext";
import * as XLSX from "xlsx";

export default function ProductLedgerPage() {
  const { productId } = useParams();
  const { settings, showToast } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/reports/ledger/${productId}`);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, [productId]);

  const exportExcel = () => {
    if (!data?.movements) return;
    const rows = data.movements.map((m) => ({
      "رقم السند": m.movementNumber,
      "التاريخ": new Date(m.date).toLocaleString("ar-SA"),
      "النوع": m.type,
      "الكمية": m.quantity,
      "سعر الوحدة": m.unitPrice,
      "إجمالي القيمة": m.totalValue,
      "الرصيد قبل": m.stockBefore,
      "الرصيد بعد": m.stockAfter,
      "المورد / المستلم": m.supplier?.name || m.recipient?.name || "",
      "البيان / الملاحظات": m.notes || m.reference || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "كشف حركة الصنف");
    XLSX.writeFile(wb, `كشف-حركة-${data.product?.code || "صنف"}.xlsx`);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const p = data?.product;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">📑 كشف حركة صنف تفصيلي (Product Ledger)</h4>
          <p className="text-muted small mb-0">تتبع تاريخي كامل ودقيق لحركات الصنف منذ افتتاحه</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success shadow-sm" onClick={exportExcel}>
            📊 تصدير Excel
          </button>
          <button className="btn btn-outline-dark shadow-sm" onClick={() => window.print()}>
            🖨️ طباعة الكشف
          </button>
          <Link to="/products" className="btn btn-outline-secondary">
            عودة لقائمة المنتجات &larr;
          </Link>
        </div>
      </div>

      {p && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <span className="text-muted small">اسم الصنف:</span>
              <h5 className="fw-bold text-dark mb-0">{p.name}</h5>
              <span className="badge bg-light text-secondary font-monospace mt-1">{p.code}</span>
            </div>
            <div className="col-md-2">
              <span className="text-muted small">التصنيف:</span>
              <div className="fw-semibold">{p.category?.name || "بدون تصنيف"}</div>
            </div>
            <div className="col-md-2">
              <span className="text-muted small">الرصيد الافتتاحي:</span>
              <div className="fw-bold">{p.openingStock} {p.unit}</div>
            </div>
            <div className="col-md-2">
              <span className="text-muted small">الرصيد الفعلي الحالي:</span>
              <h5 className="fw-bold text-primary mb-0">{p.currentStock} {p.unit}</h5>
            </div>
            <div className="col-md-2">
              <span className="text-muted small">سعر التكلفة:</span>
              <div className="fw-bold text-success">{p.purchasePrice} {settings?.currency || "ر.س"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Movements Table */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>رقم السند</th>
                <th>التاريخ</th>
                <th>نوع الحركة</th>
                <th>الكمية</th>
                <th>سعر الوحدة</th>
                <th>الرصيد قبل</th>
                <th>الرصيد بعد</th>
                <th>المورد / الجهة المستلمة</th>
                <th>البيان</th>
              </tr>
            </thead>
            <tbody>
              {data?.movements?.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    لا توجد حركات مخزنية مسجلة لهذا الصنف حتى الآن
                  </td>
                </tr>
              ) : (
                data?.movements?.map((m) => (
                  <tr key={m._id} className={m.isReversed ? "table-secondary text-muted" : ""}>
                    <td className="font-monospace fw-bold">{m.movementNumber}</td>
                    <td className="small">{new Date(m.date).toLocaleDateString("ar-SA")}</td>
                    <td>
                      {m.type === "IN" && <span className="badge bg-success">وارد (شراء)</span>}
                      {m.type === "OUT" && <span className="badge bg-danger">صادر (صرف)</span>}
                      {m.type === "ADJUSTMENT_IN" && <span className="badge bg-info">تسوية فائض</span>}
                      {m.type === "ADJUSTMENT_OUT" && <span className="badge bg-warning text-dark">تسوية عجز</span>}
                      {m.type === "REVERSAL" && <span className="badge bg-secondary">سند عكسي</span>}
                    </td>
                    <td className="fw-bold">
                      {m.type === "IN" || m.type === "ADJUSTMENT_IN" ? `+${m.quantity}` : `-${m.quantity}`} {p?.unit}
                    </td>
                    <td>{m.unitPrice}</td>
                    <td>{m.stockBefore}</td>
                    <td className="fw-bold text-primary">{m.stockAfter}</td>
                    <td className="small">{m.supplier?.name || m.recipient?.name || "—"}</td>
                    <td className="small text-muted">{m.notes || m.reference || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
