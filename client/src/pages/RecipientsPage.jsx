import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useApp } from "../context/AppContext";

export default function RecipientsPage() {
  const { showToast } = useApp();
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "customer",
    contactPerson: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRecipients = async () => {
    setLoading(true);
    try {
      const res = await api.get("/recipients");
      if (res.success) setRecipients(res.data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  const openAddModal = () => {
    setEditingRecipient(null);
    setFormData({ name: "", type: "customer", contactPerson: "", phone: "", address: "", notes: "" });
    setShowModal(true);
  };

  const openEditModal = (rec) => {
    setEditingRecipient(rec);
    setFormData({
      name: rec.name,
      type: rec.type,
      contactPerson: rec.contactPerson || "",
      phone: rec.phone || "",
      address: rec.address || "",
      notes: rec.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRecipient) {
        await api.patch(`/recipients/${editingRecipient._id}`, formData);
        showToast("تم تحديث بيانات الجهة بنجاح");
      } else {
        await api.post("/recipients", formData);
        showToast("تمت إضافة الجهة المستلمة بنجاح");
      }
      setShowModal(false);
      fetchRecipients();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا السجل؟")) return;
    try {
      await api.delete(`/recipients/${id}`);
      showToast("تم حذف السجل بنجاح");
      fetchRecipients();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const getTypeText = (t) => {
    switch (t) {
      case "department":
        return "قسم إداري / داخلي";
      case "customer":
        return "عميل / مدرسة / جهة";
      case "branch":
        return "فرع للمكتبة";
      default:
        return "أخرى";
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">🏢 الجهات المستلمة والعملاء</h4>
          <p className="text-muted small mb-0">إدارة الأقسام والمدارس والعملاء المصروف لهم قرطاسية</p>
        </div>
        <button className="btn btn-primary fw-bold shadow-sm" onClick={openAddModal}>
          ➕ إضافة جهة أو عميل جديد
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>اسم الجهة أو العميل</th>
                <th>النوع</th>
                <th>الشخص المسؤول</th>
                <th>الهاتف</th>
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
              ) : recipients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    لا توجد جهات مستلمة مسجلة
                  </td>
                </tr>
              ) : (
                recipients.map((r) => (
                  <tr key={r._id}>
                    <td className="fw-bold text-dark">{r.name}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {getTypeText(r.type)}
                      </span>
                    </td>
                    <td>{r.contactPerson || "—"}</td>
                    <td className="font-monospace">{r.phone || "—"}</td>
                    <td className="small text-muted">{r.notes || "—"}</td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => openEditModal(r)}>
                          ✏️ تعديل
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => handleDelete(r._id)}>
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
                  {editingRecipient ? "تعديل جهة مستلمة" : "إضافة جهة مستلمة أو عميل"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">الاسم *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">نوع الجهة</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="customer">عميل / جهة خارجية</option>
                      <option value="department">قسم داخلي في المؤسسة</option>
                      <option value="branch">فرع آخر للمكتبة</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">اسم المستلم أو الممثل</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">رقم الهاتف</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">العنوان</label>
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
