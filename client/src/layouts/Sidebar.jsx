import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const links = [
    { path: "/", label: "لوحة التحكم", icon: "📊" },
    { path: "/products", label: "دليل المنتجات", icon: "📦" },
    { path: "/products/new", label: "إضافة منتج جديد", icon: "➕" },
    { path: "/categories", label: "تصنيفات الأصناف", icon: "🏷️" },
    { path: "/movements/in", label: "سند إدخال مخزني (وارد)", icon: "📥", badge: "وارد", badgeClass: "bg-success" },
    { path: "/movements/out", label: "سند إخراج مخزني (صادر)", icon: "📤", badge: "صادر", badgeClass: "bg-danger" },
    { path: "/movements", label: "سجل حركات المخزون", icon: "📋" },
    { path: "/stocktaking", label: "الجرد وتسوية المخزون", icon: "⚖️" },
    { path: "/low-stock", label: "تنبيهات نواقص المخزون", icon: "⚠️" },
    { path: "/suppliers", label: "دليل الموردين", icon: "🚚" },
    { path: "/recipients", label: "الجهات المستلمة والعملاء", icon: "🏢" },
    { path: "/reports", label: "التقارير الشاملة", icon: "📑" },
  ];

  if (user?.role === "admin") {
    links.push({ path: "/users", label: "إدارة المستخدمين", icon: "👥" });
    links.push({ path: "/settings", label: "إعدادات النظام", icon: "⚙️" });
    links.push({ path: "/backups", label: "النسخ الاحتياطي والاستعادة", icon: "💾" });
  }

  return (
    <aside className="bg-dark text-white d-flex flex-column p-3 vh-100 position-sticky top-0" style={{ minWidth: "260px", maxWidth: "260px", backgroundColor: "#1a2530 !important" }}>
      <div className="pb-3 mb-3 border-bottom border-secondary d-flex align-items-center gap-2">
        <span className="fs-3">📚</span>
        <div>
          <h6 className="mb-0 fw-bold text-white">مكتبة شهد المعارف</h6>
          <small className="text-secondary" style={{ fontSize: "0.75rem" }}>نظام إدارة المخزون والمستودعات</small>
        </div>
      </div>

      <nav className="nav nav-pills flex-column flex-grow-1 overflow-y-auto pe-1" style={{ maxHeight: "calc(100vh - 150px)" }}>
        {links.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link d-flex align-items-center justify-content-between mb-1 py-2 px-3 rounded text-decoration-none ${
                isActive ? "bg-primary text-white fw-bold shadow-sm" : "text-light hover-nav"
              }`}
            >
              <div className="d-flex align-items-center gap-2">
                <span className="fs-5">{item.icon}</span>
                <span style={{ fontSize: "0.9rem" }}>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`badge ${item.badgeClass} rounded-pill`} style={{ fontSize: "0.7rem" }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-2 border-top border-secondary text-center text-muted" style={{ fontSize: "0.75rem" }}>
        إصدار 1.0.0 &copy; {new Date().getFullYear()}
      </div>
    </aside>
  );
}
