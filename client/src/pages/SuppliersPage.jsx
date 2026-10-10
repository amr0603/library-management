import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useApp } from "../context/AppContext";

export default function SuppliersPage() {
  const { showToast } = useApp();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    contactPerson: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/suppliers");
      if (res.success) setSuppliers(res.data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({ name: "", phone: "", address: "", contactPerson: "", notes: "" });
    setShowModal(true);
  };

  const openEditModal = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      phone: sup.phone || "",
      address: sup.address || "",
      contactPerson: sup.contactPerson || "",
      notes: sup.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSupplier) {
        await api.patch(`/suppliers/${editingSupplier._id}`, formData);
        showToast("تم تحديث بيانات المورد بنجاح");
      } else {
        await api.post("/suppliers", formData);
        showToast("تمت إضافة المورد بنجاح");
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا المورد؟")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      showToast("تم حذف المورد بنجاح");
      fetchSuppliers();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">🚚 دليل الموردين والشركات الموردة</h4>
          <p className="text-muted small mb-0">إدارة جهات الاتصال وبيانات التوريد المعتمدة للقرطاسية</p>
        </div>
        <button className="btn btn-primary fw-bold shadow-sm" onClick={openAddModal}>
          ➕ إضافة مورد جديد
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>اسم المورد / الشركة</th>
                <th>الشخص المسؤول</th>
                <th>الهاتف</th>
                <th>العنوان</th>
                <th>ملاحظات</th>
                <th className="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    لا يوجد موردين مسجلين
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s._id}>
                    <td className="fw-bold text-dark">{s.name}</td>
                    <td>{s.contactPerson || "—"}</td>
                    <td className="font-monospace">{s.phone || "—"}</td>
                    <td>{s.address || "—"}</td>
                    <td className="small text-muted">{s.notes || "—"}</td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => openEditModal(s)}>
                          ✏️ تعديل
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => handleDelete(s._id)}>
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
                  {editingSupplier ? "تعديل مورد" : "إضافة مورد جديد"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">اسم الشركة أو المورد *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">اسم مندوب الاتصال</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">رقم الهاتف / الجوال</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">العنوان أو المدينة</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">ملاحظات</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "جاري الحفظ..." : "حفظ المورد"}
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
