import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center bg-dark"
      dir="rtl"
      style={{
        background: "linear-gradient(135deg, #1a2530 0%, #2c3e50 100%)",
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
      }}
    >
      <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5" style={{ maxWidth: "450px", width: "90%" }}>
        <div className="text-center mb-4">
          <div className="display-4 mb-2">📚</div>
          <h3 className="fw-bold text-dark mb-1">مكتبة شهد المعارف</h3>
          <p className="text-muted small">نظام إدارة المخزون والمستودع المحلي</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 text-center small fw-semibold" role="alert">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">اسم المستخدم</label>
            <div className="input-group">
              <span className="input-group-text bg-light">👤</span>
              <input
                type="text"
                className="form-control"
                placeholder="أدخل اسم الدخول (مثال: admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">كلمة المرور</label>
            <div className="input-group">
              <span className="input-group-text bg-light">🔑</span>
              <input
                type="password"
                className="form-control"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-bold rounded-3 shadow-sm"
            disabled={loading}
          >
            {loading ? "جاري التحقق والاتصال..." : "تسجيل الدخول للنظام"}
          </button>
        </form>

        <div className="mt-4 pt-3 border-top text-center text-muted small">
          <p className="mb-1">بيانات الحسابات التجريبية الافتراضية:</p>
          <span className="badge bg-light text-dark me-2">المدير: admin / admin123456</span>
          <span className="badge bg-light text-dark">الموظف: employee / emp123456</span>
        </div>
      </div>
    </div>
  );
}
