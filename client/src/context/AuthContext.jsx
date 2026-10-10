import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("shahd_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("shahd_token");
    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem("shahd_user", JSON.stringify(res.user));
          }
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem("shahd_token");
          localStorage.removeItem("shahd_user");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    if (res.success) {
      localStorage.setItem("shahd_token", res.token);
      localStorage.setItem("shahd_user", JSON.stringify(res.user));
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || "فشل تسجيل الدخول");
  };

  const logout = () => {
    localStorage.removeItem("shahd_token");
    localStorage.removeItem("shahd_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
