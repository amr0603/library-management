import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useApp } from "../context/AppContext";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const { settings, showToast } = useApp();
  const [activeTab, setActiveTab] = useState("stock");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Report 1: Stock Inventory
  const [stockReportData, setStockReportData] = useState(null);
  const [stockCategoryFilter, setStockCategoryFilter] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Report 2: Movements
  const [movementsData, setMovementsData] = useState(null);
  const [movementTypeFilter, setMovementTypeFilter] = useState("");
  const [movementStartDate, setMovementStartDate] = useState("");
  const [movementEndDate, setMovementEndDate] = useState("");

  useEffect(() => {
    api.get("/categories").then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  const fetchStockReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (stockCategoryFilter) params.append("category", stockCategoryFilter);
      if (lowStockFilter) params.append("lowStockOnly", "true");

      const res = await api.get(`/reports/stock?${params.toString()}`);
      if (res.success) setStockReportData(res.data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMovementsReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (movementTypeFilter) params.append("type", movementTypeFilter);
      if (movementStartDate) params.append("startDate", movementStartDate);
      if (movementEndDate) params.append("endDate", movementEndDate);

      const res = await api.get(`/reports/movements?${params.toString()}`);
      if (res.success) setMovementsData(res.data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "stock") {
      fetchStockReport();
    } else if (activeTab === "movements") {
      fetchMovementsReport();
    }
  }, [activeTab, stockCategoryFilter, lowStockFilter, movementTypeFilter, movementStartDate, movementEndDate]);

  const exportStockExcel = () => {
    if (!stockReportData?.items) return;
    const data = stockReportData.items.map((i) => ({
      "كود المنتج": i.code,
      "اسم الصنف": i.name,
      "التصنيف": i.category,
      "الرصيد الحالي": i.currentStock,
      "الوحدة": i.unit,
      "سعر الشراء": i.purchasePrice,
      "إجمالي قيمة التكلفة": i.totalPurchaseValue,
      "سعر البيع": i.sellingPrice,
      "إجمالي قيمة البيع المقدرة": i.totalSellingValue,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "تقرير جرد وتقييم المخزون");
    XLSX.writeFile(wb, `تقرير-جرد-المخزون-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportMovementsExcel = () => {
    if (!movementsData?.items) return;
    const data = movementsData.items.map((m) => ({
      "رقم السند": m.movementNumber,
      "التاريخ": new Date(m.date).toLocaleString("ar-SA"),
      "الصنف": m.product?.name,
      "نوع الحركة": m.type,
      "الكمية": m.quantity,
      "سعر الوحدة": m.unitPrice,
      "إجمالي القيمة": m.totalValue,
      "المورد / المستلم": m.supplier?.name || m.recipient?.name || "",
      "المسؤول": m.createdBy?.name || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "تقرير الحركات");
    XLSX.writeFile(wb, `تقرير-حركات-المخزون-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">📑 التقارير المالية والمخزنية المتكاملة</h4>
          <p className="text-muted small mb-0">تقارير الجرد، تقييم بضاعة آخر المدة، وحركات الوارد والصادر الدقيقة</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-success shadow-sm"
            onClick={activeTab === "stock" ? exportStockExcel : exportMovementsExcel}
          >
            📊 تصدير Excel
          </button>
          <button className="btn btn-outline-dark shadow-sm" onClick={() => window.print()}>
            🖨️ طباعة التقرير
          </button>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-3 shadow-sm border">
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${activeTab === "stock" ? "active" : ""}`}
            onClick={() => setActiveTab("stock")}
          >
            📦 تقرير جرد وتقييم المخزون المالي
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold ${activeTab === "movements" ? "active" : ""}`}
            onClick={() => setActiveTab("movements")}
          >
            🔄 تقرير حركات الوارد والصادر بالفترة
          </button>
        </li>
      </ul>

      {/* Tab 1: Stock Inventory */}
      {activeTab === "stock" && (
        <div>
          {/* Summary Box */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-primary border-4">
                <span className="text-muted small">إجمالي الأصناف المدرجة:</span>
                <h4 className="fw-bold text-dark my-1">{stockReportData?.summary?.totalProducts || 0} صنف</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-info border-4">
                <span className="text-muted small">إجمالي عدد الوحدات:</span>
                <h4 className="fw-bold text-info my-1">{stockReportData?.summary?.totalUnits || 0} وحدة</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-success border-4">
                <span className="text-muted small">القيمة الإجمالية بالتكلفة (شراء):</span>
                <h4 className="fw-bold text-success my-1">
                  {stockReportData?.summary?.totalPurchaseCost?.toLocaleString()} {settings?.currency || "ر.س"}
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-warning border-4">
                <span className="text-muted small">القيمة التقديرية للبيع:</span>
                <h4 className="fw-bold text-warning-emphasis my-1">
                  {stockReportData?.summary?.totalSellingValue?.toLocaleString()} {settings?.currency || "ر.س"}
                </h4>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
            <div className="row g-3 align-items-center">
              <div className="col-md-5">
                <select
                  className="form-select"
                  value={stockCategoryFilter}
                  onChange={(e) => setStockCategoryFilter(e.target.value)}
                >
                  <option value="">جميع التصنيفات</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <div className="form-check form-switch pt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="lowStockCheck"
                    checked={lowStockFilter}
                    onChange={(e) => setLowStockFilter(e.target.checked)}
                  />
                  <label className="form-check-label fw-bold" htmlFor="lowStockCheck">
                    الأصناف التي بلغت حد الطلب الأدنى فقط
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>كود الصنف</th>
                    <th>اسم المنتج</th>
                    <th>التصنيف</th>
                    <th>الرصيد الفعلي</th>
                    <th>سعر التكلفة</th>
                    <th>إجمالي التكلفة</th>
                    <th>سعر البيع</th>
                    <th>إجمالي قيمة البيع</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                      </td>
                    </tr>
                  ) : stockReportData?.items?.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        لا توجد بيانات مطابقة
                      </td>
                    </tr>
                  ) : (
                    stockReportData?.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="font-monospace fw-bold">{item.code}</td>
                        <td className="fw-semibold">{item.name}</td>
                        <td>{item.category}</td>
                        <td>
                          <span className={`badge ${item.isLowStock ? "bg-danger" : "bg-light text-dark border"} fs-6`}>
                            {item.currentStock} {item.unit}
                          </span>
                        </td>
                        <td>{item.purchasePrice}</td>
                        <td className="fw-bold text-success">{item.totalPurchaseValue}</td>
                        <td>{item.sellingPrice}</td>
                        <td className="fw-bold text-primary">{item.totalSellingValue}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Movements */}
      {activeTab === "movements" && (
        <div>
          {/* Summary */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-primary border-4">
                <span className="text-muted small">عدد السندات المسجلة:</span>
                <h4 className="fw-bold text-dark my-1">{movementsData?.summary?.count || 0} سند</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-info border-4">
                <span className="text-muted small">إجمالي الكميات المحركة:</span>
                <h4 className="fw-bold text-info my-1">{movementsData?.summary?.totalQuantity || 0} وحدة</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-success border-4">
                <span className="text-muted small">إجمالي القيمة المالية:</span>
                <h4 className="fw-bold text-success my-1">
                  {movementsData?.summary?.totalValue?.toLocaleString()} {settings?.currency || "ر.س"}
                </h4>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
            <div className="row g-3">
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={movementTypeFilter}
                  onChange={(e) => setMovementTypeFilter(e.target.value)}
                >
                  <option value="">جميع أنواع الحركات</option>
                  <option value="IN">وارد (إدخال)</option>
                  <option value="OUT">صادر (صرف)</option>
                  <option value="ADJUSTMENT_IN">تسوية جردية (فائض)</option>
                  <option value="ADJUSTMENT_OUT">تسوية جردية (عجز)</option>
                </select>
              </div>
              <div className="col-md-4">
                <input
                  type="date"
                  className="form-control"
                  value={movementStartDate}
                  onChange={(e) => setMovementStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="date"
                  className="form-control"
                  value={movementEndDate}
                  onChange={(e) => setMovementEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>رقم السند</th>
                    <th>التاريخ</th>
                    <th>الصنف</th>
                    <th>النوع</th>
                    <th>الكمية</th>
                    <th>سعر الوحدة</th>
                    <th>إجمالي القيمة</th>
                    <th>الجهة / المورد</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                      </td>
                    </tr>
                  ) : movementsData?.items?.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        لا توجد حركات مسجلة في هذه الفترة
                      </td>
                    </tr>
                  ) : (
                    movementsData?.items?.map((m) => (
                      <tr key={m._id}>
                        <td className="font-monospace fw-bold">{m.movementNumber}</td>
                        <td className="small text-muted">{new Date(m.date).toLocaleDateString("ar-SA")}</td>
                        <td className="fw-semibold">{m.product?.name}</td>
                        <td>
                          {m.type === "IN" && <span className="badge bg-success">وارد</span>}
                          {m.type === "OUT" && <span className="badge bg-danger">صادر</span>}
                          {m.type === "ADJUSTMENT_IN" && <span className="badge bg-info">تسوية فائض</span>}
                          {m.type === "ADJUSTMENT_OUT" && <span className="badge bg-warning text-dark">تسوية عجز</span>}
                        </td>
                        <td className="fw-bold">{m.quantity} {m.product?.unit}</td>
                        <td>{m.unitPrice}</td>
                        <td className="fw-bold text-success">{m.totalValue}</td>
                        <td>{m.supplier?.name || m.recipient?.name || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
