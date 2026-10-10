import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useApp } from "../context/AppContext";
import * as XLSX from "xlsx";

export default function ProductsPage() {
  const { settings, showToast } = useApp();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
        search,
        status: selectedStatus !== "all" ? selectedStatus : "",
        category: selectedCategory,
      });

      const res = await api.get(`/products?${params.toString()}`);
      if (res.success) {
        setProducts(res.data);
        setTotalPages(res.pagination.pages);
        setTotalCount(res.pagination.total);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, selectedCategory, selectedStatus]);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/products/${id}/status`, { isActive: !currentStatus });
      showToast(`تم ${!currentStatus ? "تفعيل" : "تعطيل"} المنتج بنجاح`);
      fetchProducts();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const exportToExcel = () => {
    const exportData = products.map((p) => ({
      "كود المنتج": p.code,
      "اسم المنتج": p.name,
      "التصنيف": p.category?.name || "بدون تصنيف",
      "الوحدة": p.unit,
      "الرصيد الحالي": p.currentStock,
      "سعر الشراء": p.purchasePrice,
      "سعر البيع": p.sellingPrice,
      "حد الطلب الأدنى": p.minStock,
      "الحالة": p.isActive ? "نشط" : "معطل",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المنتجات");
    XLSX.writeFile(wb, `منتجات-شهد-المعارف-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">دليل المنتجات والأصناف</h4>
          <p className="text-muted small mb-0">إجمالي الأصناف المسجلة: {totalCount} صنف</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success shadow-sm" onClick={exportToExcel}>
            📊 تصدير Excel
          </button>
          <Link to="/products/new" className="btn btn-primary shadow-sm fw-bold">
            ➕ إضافة منتج جديد
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
        <div className="row g-3">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 بحث باسم المنتج أو الكود..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">جميع التصنيفات</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط فقط</option>
              <option value="inactive">معطل فقط</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>كود المنتج</th>
                <th>اسم المنتج</th>
                <th>التصنيف</th>
                <th>الرصيد الحالي</th>
                <th>سعر الشراء</th>
                <th>سعر البيع</th>
                <th>الحالة</th>
                <th className="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    لا توجد منتجات تطابق معايير البحث
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.currentStock <= p.minStock;
                  return (
                    <tr key={p._id}>
                      <td className="font-monospace fw-bold">{p.code}</td>
                      <td>
                        <div className="fw-bold text-dark">{p.name}</div>
                        {p.description && <small className="text-muted">{p.description}</small>}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {p.category?.name || "بدون تصنيف"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isLow ? "bg-danger" : "bg-success"} fs-6`}>
                          {p.currentStock} {p.unit}
                        </span>
                        {isLow && (
                          <small className="d-block text-danger fw-semibold" style={{ fontSize: "0.75rem" }}>
                            أقل من الحد ({p.minStock})
                          </small>
                        )}
                      </td>
                      <td>{p.purchasePrice} {settings?.currency || "ر.س"}</td>
                      <td className="fw-bold">{p.sellingPrice} {settings?.currency || "ر.س"}</td>
                      <td>
                        <span className={`badge ${p.isActive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                          {p.isActive ? "نشط" : "معطل"}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <Link
                            to={`/products/edit/${p._id}`}
                            className="btn btn-outline-primary"
                            title="تعديل بيانات المنتج"
                          >
                            ✏️ تعديل
                          </Link>
                          <Link
                            to={`/reports/ledger/${p._id}`}
                            className="btn btn-outline-secondary"
                            title="كشف حركة الصنف"
                          >
                            📑 كشف
                          </Link>
                          <button
                            className={`btn ${p.isActive ? "btn-outline-warning" : "btn-outline-success"}`}
                            onClick={() => toggleStatus(p._id, p.isActive)}
                            title={p.isActive ? "تعطيل الصنف" : "تفعيل الصنف"}
                          >
                            {p.isActive ? "إيقاف" : "تفعيل"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
    </div>
  );
}
