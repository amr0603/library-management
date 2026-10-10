import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useApp } from "../context/AppContext";
import * as XLSX from "xlsx";

export default function MovementsHistoryPage() {
  const { settings, showToast } = useApp();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMovement, setSelectedMovement] = useState(null);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
        type,
        startDate,
        endDate,
        search,
      });

      const res = await api.get(`/movements?${params.toString()}`);
      if (res.success) {
        setMovements(res.data);
        setTotalPages(res.pagination.pages);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [page, type, startDate, endDate, search]);

  const handleReversal = async (mov) => {
    if (
      !window.confirm(
        `تنبيه تدقيقي: هل أنت متأكد من رغبتك في عكس وإلغاء السند رقم (${mov.movementNumber})؟ سيتم إنشاء حركة عكسية موثقة لتعديل الرصيد تلقائياً.`
      )
    )
      return;

    try {
      const res = await api.post(`/movements/${mov._id}/reversal`);
      showToast(res.message);
      fetchMovements();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const exportExcel = () => {
    const data = movements.map((m) => ({
      "رقم السند": m.movementNumber,
      "التاريخ": new Date(m.date).toLocaleString("ar-SA"),
      "اسم المنتج": m.product?.name || "",
      "كود المنتج": m.product?.code || "",
      "نوع الحركة": m.type,
      "الكمية": m.quantity,
      "سعر الوحدة": m.unitPrice,
      "إجمالي القيمة": m.totalValue,
      "الرصيد بعد الحركة": m.stockAfter,
      "المورد / المستلم": m.supplier?.name || m.recipient?.name || "",
      "المرجع": m.reference || "",
      "المسؤول": m.createdBy?.name || "",
      "الحالة": m.isReversed ? "تم إلغاؤه (معكوس)" : "معتمد",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "حركات المخزون");
    XLSX.writeFile(wb, `سجل-حركات-المخزن-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">📋 سجل حركات المخزون والتدقيق</h4>
          <p className="text-muted small mb-0">سجل تدقيقي كامل لكافة سندات الإدخال والصرف والتسويات الجردية</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success shadow-sm" onClick={exportExcel}>
            📊 تصدير Excel
          </button>
          <button className="btn btn-outline-dark shadow-sm" onClick={() => window.print()}>
            🖨️ طباعة
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 بحث برقم السند أو المرجع..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">جميع أنواع الحركات</option>
              <option value="IN">وارد (إدخال)</option>
              <option value="OUT">صادر (صرف)</option>
              <option value="ADJUSTMENT_IN">تسوية جردية (فائض)</option>
              <option value="ADJUSTMENT_OUT">تسوية جردية (عجز)</option>
              <option value="REVERSAL">حركة عكسية (إلغاء)</option>
            </select>
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>رقم السند</th>
                <th>التاريخ</th>
                <th>المنتج</th>
                <th>النوع</th>
                <th>الكمية</th>
                <th>الرصيد بعد الحركة</th>
                <th>الجهة / المرجع</th>
                <th>المستخدم</th>
                <th className="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    لا توجد حركات مخزنية مسجلة
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m._id} className={m.isReversed ? "table-secondary text-muted" : ""}>
                    <td className="font-monospace fw-bold">
                      {m.movementNumber}
                      {m.isReversed && (
                        <span className="badge bg-secondary d-block mt-1" style={{ fontSize: "0.7rem" }}>
                          معكوس (ملغي)
                        </span>
                      )}
                    </td>
                    <td className="small">{new Date(m.date).toLocaleDateString("ar-SA")}</td>
                    <td>
                      <div className="fw-semibold">{m.product?.name}</div>
                      <small className="text-muted font-monospace">{m.product?.code}</small>
                    </td>
                    <td>
                      {m.type === "IN" && <span className="badge bg-success">وارد (إدخال)</span>}
                      {m.type === "OUT" && <span className="badge bg-danger">صادر (صرف)</span>}
                      {m.type === "ADJUSTMENT_IN" && <span className="badge bg-info">تسوية فائض</span>}
                      {m.type === "ADJUSTMENT_OUT" && <span className="badge bg-warning text-dark">تسوية عجز</span>}
                      {m.type === "REVERSAL" && <span className="badge bg-secondary">سند عكسي</span>}
                    </td>
                    <td className="fw-bold">
                      {m.quantity} {m.product?.unit}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{m.stockAfter}</span>
                    </td>
                    <td className="small">
                      {m.supplier?.name || m.recipient?.name || m.reference || "—"}
                    </td>
                    <td className="small text-muted">{m.createdBy?.name || "المسؤول"}</td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => setSelectedMovement(m)}
                          title="عرض تفاصيل السند"
                        >
                          👁️ تفاصيل
                        </button>
                        {!m.isReversed && m.type !== "REVERSAL" && (
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleReversal(m)}
                            title="إلغاء وعكس الحركة"
                          >
                            ↩️ إلغاء
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center p-3 border-top">
            <span className="text-muted small">
              الصفحة {page} من {totalPages}
            </span>
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                السابق
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Movement Details Modal */}
      {selectedMovement && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">تفاصيل السند المخزني</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedMovement(null)}></button>
              </div>
              <div className="modal-body">
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between">
                    <strong>رقم السند:</strong>
                    <span className="font-monospace">{selectedMovement.movementNumber}</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between">
                    <strong>تاريخ ووقت السند:</strong>
                    <span>{new Date(selectedMovement.date).toLocaleString("ar-SA")}</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between">
                    <strong>الصنف:</strong>
                    <span>{selectedMovement.product?.name}</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between">
                    <strong>نوع الحركة:</strong>
                    <span>{selectedMovement.type}</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between">
                    <strong>الكمية:</strong>
                    <span className="fw-bold">{selectedMovement.quantity} {selectedMovement.product?.unit}</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between">
                    <strong>سعر الوحدة:</strong>
                    <span>{selectedMovement.unitPrice} {settings?.currency || "ر.س"}</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between">
                    <strong>إجمالي القيمة:</strong>
                    <span className="fw-bold text-success">{selectedMovement.totalValue} {settings?.currency || "ر.س"}</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between">
                    <strong>الرصيد قبل الحركة:</strong>
                    <span>{selectedMovement.stockBefore}</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between">
                    <strong>الرصيد بعد الحركة:</strong>
                    <span className="fw-bold text-primary">{selectedMovement.stockAfter}</span>
                  </div>
                  {selectedMovement.supplier && (
                    <div className="list-group-item d-flex justify-content-between">
                      <strong>المورد:</strong>
                      <span>{selectedMovement.supplier.name}</span>
                    </div>
                  )}
                  {selectedMovement.recipient && (
                    <div className="list-group-item d-flex justify-content-between">
                      <strong>الجهة المستلمة:</strong>
                      <span>{selectedMovement.recipient.name}</span>
                    </div>
                  )}
                  {selectedMovement.reference && (
                    <div className="list-group-item d-flex justify-content-between">
                      <strong>رقم المرجع / الفاتورة:</strong>
                      <span>{selectedMovement.reference}</span>
                    </div>
                  )}
                  {selectedMovement.notes && (
                    <div className="list-group-item">
                      <strong>ملاحظات:</strong>
                      <p className="mb-0 text-muted mt-1">{selectedMovement.notes}</p>
                    </div>
                  )}
                  <div className="list-group-item d-flex justify-content-between">
                    <strong>المسؤول عن الحركة:</strong>
                    <span>{selectedMovement.createdBy?.name}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedMovement(null)}>
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
