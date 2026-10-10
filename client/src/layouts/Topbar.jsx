import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      setSuccess("تم تغيير كلمة المرور بنجاح");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="navbar navbar-expand bg-white border-bottom px-4 py-2 sticky-top shadow-sm d-flex justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-light text-dark border p-2 rounded-3 d-flex align-items-center gap-2">
            <span>🟢</span>
            <span className="fw-semibold">قاعدة البيانات: متصل ومحلي</span>
          </span>
          <span className="text-muted d-none d-md-inline" style={{ fontSize: "0.85rem" }}>
            {new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <div className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>{user?.name || "المستخدم"}</div>
            <div className="badge bg-secondary-subtle text-secondary" style={{ fontSize: "0.75rem" }}>
              {user?.role === "admin" ? "مدير النظام (Admin)" : "موظف مخزن (Employee)"}
            </div>
          </div>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowPasswordModal(true)}
            title="تغيير كلمة المرور"
          >
            🔒 كلمة المرور
          </button>

          <button
            className="btn btn-outline-danger btn-sm"
            onClick={logout}
            title="تسجيل الخروج"
          >
            🚪 خروج
          </button>
        </div>
      </header>

      {showPasswordModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">تغيير كلمة المرور</h5>
                <button type="button" className="btn-close" onClick={() => setShowPasswordModal(false)}></button>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  {success && <div className="alert alert-success py-2">{success}</div>}
                  <div className="mb-3">
                    <label className="form-label">كلمة المرور الحالية</label>
                    <input
                      type="password"
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                    <small className="text-muted">الحد الأدنى 6 أحرف أو أرقام</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                    إلغاء
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
