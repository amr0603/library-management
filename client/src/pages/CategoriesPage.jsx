import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useApp } from "../context/AppContext";

export default function CategoriesPage() {
  const { showToast } = useApp();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories");
      if (res.success) setCategories(res.data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory._id}`, { name, description });
        showToast("تم تحديث التصنيف بنجاح");
      } else {
        await api.post("/categories", { name, description });
        showToast("تمت إضافة التصنيف بنجاح");
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا التصنيف؟")) return;
    try {
      await api.delete(`/categories/${id}`);
      showToast("تم حذف التصنيف بنجاح");
      fetchCategories();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">🏷️ تصنيفات الأصناف والقرطاسية</h4>
          <p className="text-muted small mb-0">إدارة تصنيفات وتصنيف المنتجات في المستودع</p>
        </div>
        <button className="btn btn-primary fw-bold shadow-sm" onClick={openAddModal}>
          ➕ إضافة تصنيف جديد
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>اسم التصنيف</th>
                <th>الوصف والملاحظات</th>
                <th>تاريخ الإنشاء</th>
                <th>الحالة</th>
                <th className="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    لا توجد تصنيفات مسجلة
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c._id}>
                    <td className="fw-bold text-dark">{c.name}</td>
                    <td className="text-muted">{c.description || "—"}</td>
                    <td className="small text-muted">{new Date(c.createdAt).toLocaleDateString("ar-SA")}</td>
                    <td>
                      <span className={`badge ${c.isActive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                        {c.isActive ? "نشط" : "معطل"}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => openEditModal(c)}>
                          ✏️ تعديل
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => handleDelete(c._id)}>
                          🗑️ حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingCategory ? "تعديل تصنيف" : "إضافة تصنيف جديد"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">اسم التصنيف *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: أقلام ومحابر"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">الوصف</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="وصف محتويات هذا التصنيف..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "جاري الحفظ..." : "حفظ"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
