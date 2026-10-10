import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: "مكتبة شهد المعارف للقرطاسية والأدوات المكتبية",
    currency: "ر.س",
    units: ["قطعة", "علبة", "درزن", "رزمة", "كرتون", "حزمة", "طقم", "متر"],
    lowStockThresholdDefault: 5,
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.warn("Could not load settings:", err.message);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <AppContext.Provider value={{ settings, setSettings, fetchSettings, toast, showToast }}>
      {children}
      {toast && (
        <div
          className="position-fixed bottom-0 start-50 translate-middle-x p-3"
          style={{ zIndex: 9999 }}
        >
          <div className={`toast show align-items-center text-white bg-${toast.type === "error" ? "danger" : toast.type === "warning" ? "warning text-dark" : "success"} border-0 shadow-lg`} role="alert">
            <div className="d-flex">
              <div className="toast-body fw-bold fs-6 py-3 px-4">
                {toast.type === "error" ? "⚠️ " : toast.type === "warning" ? "🔔 " : "✅ "}
                {toast.message}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToast(null)}
              ></button>
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
