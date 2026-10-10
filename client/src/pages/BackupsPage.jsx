import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useApp } from "../context/AppContext";

export default function BackupsPage() {
  const { showToast } = useApp();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await api.get("/backups/list");
      if (res.success) setBackups(res.data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const res = await api.post("/backups/create");
      if (res.success) {
        showToast(res.message);
        fetchBackups();
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (filename) => {
    if (
      !window.confirm(
        `تحذير حرج: استعادة النسخة (${filename}) ستستبدل البيانات الحالية وتحدث قاعدة البيانات بالكامل. هل تريد المتابعة بالتأكيد؟`
      )
    )
      return;

    setRestoring(true);
    try {
      const res = await api.post("/backups/restore", { filename });
      if (res.success) {
        showToast(res.message);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">💾 النسخ الاحتياطي واستعادة قاعدة البيانات</h4>
          <p className="text-muted small mb-0">
            حماية بيانات المخزون والحركات والمستخدمين بإنشاء نسخ محلية بصيغة JSON آمنة وقابلة للاسترجاع الفوري
          </p>
        </div>
        <button
          className="btn btn-success fw-bold shadow-sm"
          onClick={handleCreateBackup}
          disabled={creating}
        >
          {creating ? "جاري إنشاء النسخة..." : "⚡ إنشاء نسخة احتياطية جديدة الآن"}
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>اسم ملف النسخة الاحتياطية</th>
                <th>حجم الملف</th>
                <th>تاريخ الإنشاء</th>
                <th className="text-center">إجراءات الاستعادة</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    لا توجد نسخ احتياطية محفوظة حتى الآن. اضغط على الزر أعلاه لإنشاء أول نسخة.
                  </td>
                </tr>
              ) : (
                backups.map((b) => (
                  <tr key={b.filename}>
                    <td className="font-monospace fw-bold">{b.filename}</td>
                    <td>{b.size}</td>
                    <td className="small text-muted">{new Date(b.createdAt).toLocaleString("ar-SA")}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-warning fw-bold"
                        onClick={() => handleRestore(b.filename)}
                        disabled={restoring}
                      >
                        {restoring ? "جاري الاستعادة..." : "🔄 استعادة هذه النسخة"}
                      </button>
                    </td>
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
