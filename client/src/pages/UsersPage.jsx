import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useApp } from "../context/AppContext";

export default function UsersPage() {
  const { showToast } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "employee",
    permissions: {
      canManageProducts: true,
      canCreateMovements: true,
      canViewReports: false,
      canManageSettings: false,
      canManageUsers: false,
      canPerformStocktake: false,
    },
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/users");
      if (res.success) setUsers(res.data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      username: "",
      password: "",
      role: "employee",
      permissions: {
        canManageProducts: true,
        canCreateMovements: true,
        canViewReports: false,
        canManageSettings: false,
        canManageUsers: false,
        canPerformStocktake: false,
      },
    });
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      username: u.username,
      password: "",
      role: u.role,
      permissions: {
        canManageProducts: !!u.permissions?.canManageProducts,
        canCreateMovements: !!u.permissions?.canCreateMovements,
        canViewReports: !!u.permissions?.canViewReports,
        canManageSettings: !!u.permissions?.canManageSettings,
        canManageUsers: !!u.permissions?.canManageUsers,
        canPerformStocktake: !!u.permissions?.canPerformStocktake,
      },
    });
    setShowModal(true);
  };

  const handlePermissionChange = (key) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        await api.patch(`/auth/users/${editingUser._id}`, formData);
        showToast("تم تحديث بيانات المستخدم بنجاح");
      } else {
        await api.post("/auth/users", formData);
        showToast("تم إنشاء المستخدم بنجاح");
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      await api.patch(`/auth/users/${user._id}`, { isActive: !user.isActive });
      showToast(`تم ${!user.isActive ? "تفعيل" : "تعطيل"} حساب المستخدم`);
      fetchUsers();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">👥 إدارة المستخدمين والصلاحيات</h4>
          <p className="text-muted small mb-0">إدارة حسابات موظفي المكتبة وتحديد صلاحيات الوصول والعمليات</p>
        </div>
        <button className="btn btn-primary fw-bold shadow-sm" onClick={openAddModal}>
          ➕ إضافة مستخدم جديد
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>الاسم الكامل</th>
                <th>اسم الدخول</th>
                <th>الدور الوظيفي</th>
                <th>الصلاحيات الممنوحة</th>
                <th>الحالة</th>
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
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td className="fw-bold text-dark">{u.name}</td>
                    <td className="font-monospace">{u.username}</td>
                    <td>
                      <span className={`badge ${u.role === "admin" ? "bg-primary" : "bg-secondary"}`}>
                        {u.role === "admin" ? "مدير نظام (Admin)" : "موظف مخزن (Employee)"}
                      </span>
                    </td>
                    <td className="small">
                      {u.role === "admin" ? (
                        <span className="text-success fw-bold">كامل الصلاحيات (Full Access)</span>
                      ) : (
                        <div className="d-flex flex-wrap gap-1">
                          {u.permissions?.canManageProducts && <span className="badge bg-light text-dark border">المنتجات</span>}
                          {u.permissions?.canCreateMovements && <span className="badge bg-light text-dark border">الحركات</span>}
                          {u.permissions?.canViewReports && <span className="badge bg-light text-dark border">التقارير</span>}
                          {u.permissions?.canPerformStocktake && <span className="badge bg-light text-dark border">الجرد</span>}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                        {u.isActive ? "نشط" : "معطل"}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => openEditModal(u)}>
                          ✏️ تعديل
                        </button>
                        <button
                          className={`btn ${u.isActive ? "btn-outline-warning" : "btn-outline-success"}`}
                          onClick={() => toggleUserStatus(u)}
                        >
                          {u.isActive ? "تعطيل" : "تفعيل"}
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
                  {editingUser ? "تعديل بيانات المستخدم" : "إنشاء مستخدم جديد"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">الاسم الكامل *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">اسم الدخول (Username) *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={Boolean(editingUser)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      {editingUser ? "كلمة المرور الجديدة (اتركها فارغة إذا لم ترغب بتغييرها)" : "كلمة المرور *"}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      minLength={6}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">الدور الوظيفي</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="employee">موظف تشغيلي (Employee)</option>
                      <option value="admin">مدير نظام (Admin)</option>
                    </select>
                  </div>

                  {formData.role === "employee" && (
                    <div className="border rounded-3 p-3 bg-light mb-3">
                      <label className="form-label fw-bold mb-2">تحديد الصلاحيات التشغيلية:</label>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="p_prod"
                          checked={formData.permissions.canManageProducts}
                          onChange={() => handlePermissionChange("canManageProducts")}
                        />
                        <label className="form-check-label" htmlFor="p_prod">
                          إدارة المنتجات والتصنيفات
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="p_mov"
                          checked={formData.permissions.canCreateMovements}
                          onChange={() => handlePermissionChange("canCreateMovements")}
                        />
                        <label className="form-check-label" htmlFor="p_mov">
                          تسجيل سندات الإدخال والصرف
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="p_rep"
                          checked={formData.permissions.canViewReports}
                          onChange={() => handlePermissionChange("canViewReports")}
                        />
                        <label className="form-check-label" htmlFor="p_rep">
                          الاطلاع على التقارير المالية وكشوف الحركة
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="p_stk"
                          checked={formData.permissions.canPerformStocktake}
                          onChange={() => handlePermissionChange("canPerformStocktake")}
                        />
                        <label className="form-check-label" htmlFor="p_stk">
                          إجراء الجرد والتسويات المخزنية
                        </label>
                      </div>
                    </div>
                  )}
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
