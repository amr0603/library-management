import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useApp } from "../context/AppContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardPage() {
  const { settings } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchSummary = async () => {
    setLoading(true);
    try {
      let url = "/reports/dashboard/summary";
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [startDate, endDate]);

  if (loading && !data) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">حدث خطأ في تحميل بيانات لوحة التحكم: {error}</div>;
  }

  const chartLabels = data?.chartData?.map((d) => d.date) || [];
  const chartIncoming = data?.chartData?.map((d) => d.incoming) || [];
  const chartOutgoing = data?.chartData?.map((d) => d.outgoing) || [];

  const barChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "الكميات الواردة (إدخال مخزني)",
        data: chartIncoming,
        backgroundColor: "rgba(40, 167, 69, 0.75)",
      },
      {
        label: "الكميات الصادرة (صرف مخزني)",
        data: chartOutgoing,
        backgroundColor: "rgba(220, 53, 69, 0.75)",
      },
    ],
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">لوحة التحكم والمؤشرات الرئيسية</h4>
          <p className="text-muted small mb-0">نظرة عامة وفورية على حالة المخزون وحركة التوريد والصرف</p>
        </div>

        <div className="d-flex align-items-center gap-2 bg-white p-2 rounded-3 border shadow-sm">
          <span className="small text-muted fw-semibold">تصفية الفترة:</span>
          <input
            type="date"
            className="form-control form-control-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="small text-muted">إلى</span>
          <input
            type="date"
            className="form-control form-control-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {(startDate || endDate) && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              إلغاء
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-primary border-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold">عدد الأصناف النشطة</div>
                <h3 className="fw-bold my-1 text-dark">{data?.activeProductsCount || 0}</h3>
                <small className="text-muted">{data?.totalCategoriesCount || 0} تصنيفات رئيسية</small>
              </div>
              <div className="fs-1 text-primary">📦</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-info border-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold">إجمالي رصيد القطع بالمخزن</div>
                <h3 className="fw-bold my-1 text-dark">{data?.totalStockQuantity?.toLocaleString() || 0}</h3>
                <small className="text-muted">وحدة قياس مخزنية</small>
              </div>
              <div className="fs-1 text-info">📊</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-success border-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold">القيمة التقديرية (بسعر الشراء)</div>
                <h3 className="fw-bold my-1 text-success">
                  {data?.totalInventoryValue?.toLocaleString()} {settings?.currency || "ر.س"}
                </h3>
                <small className="text-muted">محسوبة بالتكلفة الفعلية</small>
              </div>
              <div className="fs-1 text-success">💰</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-danger border-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold">أصناف تحت حد الطلب (نواقص)</div>
                <h3 className="fw-bold my-1 text-danger">{data?.lowStockCount || 0}</h3>
                <Link to="/low-stock" className="small text-danger text-decoration-none fw-bold">
                  عرض تفاصيل النواقص &larr;
                </Link>
              </div>
              <div className="fs-1 text-danger">⚠️</div>
            </div>
          </div>
        </div>
      </div>

      {/* Movement stats cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="badge bg-success-subtle text-success fs-6 px-3 py-2">
                📥 إجمالي الوارد (الفترة المحددة)
              </span>
              <span className="fw-bold text-success fs-5">
                {data?.periodInQty?.toLocaleString()} وحدة
              </span>
            </div>
            <div className="d-flex justify-content-between small text-muted border-top pt-2">
              <span>القيمة الإجمالية للشراء:</span>
              <span className="fw-semibold">
                {data?.periodInValue?.toLocaleString()} {settings?.currency || "ر.س"}
              </span>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="badge bg-danger-subtle text-danger fs-6 px-3 py-2">
                📤 إجمالي الصادر (الفترة المحددة)
              </span>
              <span className="fw-bold text-danger fs-5">
                {data?.periodOutQty?.toLocaleString()} وحدة
              </span>
            </div>
            <div className="d-flex justify-content-between small text-muted border-top pt-2">
              <span>القيمة التقديرية للصرف:</span>
              <span className="fw-semibold">
                {data?.periodOutValue?.toLocaleString()} {settings?.currency || "ر.س"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Low Stock List */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <h6 className="fw-bold text-dark mb-3">📈 مقارنة حركة الوارد والصادر (آخر 7 أيام)</h6>
            <div style={{ minHeight: "260px" }}>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "top", rtl: true } },
                }}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-danger mb-0">🚨 أصناف قاربت على النفاد</h6>
              <Link to="/low-stock" className="btn btn-sm btn-outline-danger">
                الكل
              </Link>
            </div>
            {data?.lowStockProducts?.length === 0 ? (
              <div className="text-center py-4 text-muted">
                ✅ جميع الأصناف متوفرة بأرصدة كافية فوق حد الطلب
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>الصنف</th>
                      <th>الرصيد الحالي</th>
                      <th>حد الطلب</th>
                      <th>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.lowStockProducts?.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="fw-bold text-dark" style={{ fontSize: "0.85rem" }}>
                            {item.name}
                          </div>
                          <span className="badge bg-light text-secondary font-monospace">
                            {item.code}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-danger">{item.currentStock} {item.unit}</span>
                        </td>
                        <td className="text-muted">{item.minStock} {item.unit}</td>
                        <td>
                          <Link
                            to={`/movements/in?productId=${item._id}`}
                            className="btn btn-sm btn-success py-0 px-2"
                            title="توريد فوري"
                          >
                            + توريد
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Movements Table */}
      <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold text-dark mb-0">📋 أحدث حركات المخزون المسجلة</h6>
          <Link to="/movements" className="btn btn-sm btn-outline-primary">
            عرض كافة الحركات
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>رقم السند</th>
                <th>التاريخ</th>
                <th>المنتج</th>
                <th>نوع الحركة</th>
                <th>الكمية</th>
                <th>الرصيد بعد الحركة</th>
                <th>المستخدم</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentMovements?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    لا توجد حركات مخزنية مسجلة حتى الآن
                  </td>
                </tr>
              ) : (
                data?.recentMovements?.map((m) => (
                  <tr key={m._id}>
                    <td className="font-monospace fw-bold">{m.movementNumber}</td>
                    <td className="small text-muted">{new Date(m.date).toLocaleDateString("ar-SA")}</td>
                    <td>
                      <span className="fw-semibold">{m.product?.name || "غير محدد"}</span>
                      <small className="text-muted d-block font-monospace">{m.product?.code}</small>
                    </td>
                    <td>
                      {m.type === "IN" && <span className="badge bg-success">وارد (إدخال)</span>}
                      {m.type === "OUT" && <span className="badge bg-danger">صادر (صرف)</span>}
                      {m.type === "ADJUSTMENT_IN" && <span className="badge bg-info">تسوية فائض</span>}
                      {m.type === "ADJUSTMENT_OUT" && <span className="badge bg-warning text-dark">تسوية عجز</span>}
                      {m.type === "REVERSAL" && <span className="badge bg-secondary">سند عكسي</span>}
                    </td>
                    <td className="fw-bold">{m.quantity} {m.product?.unit}</td>
                    <td>
                      <span className="badge bg-light text-dark border">{m.stockAfter}</span>
                    </td>
                    <td className="small text-muted">{m.createdBy?.name || "المسؤول"}</td>
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
