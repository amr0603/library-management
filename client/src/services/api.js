import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("shahd_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("shahd_token");
      localStorage.removeItem("shahd_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    const message = error.response?.data?.message || error.message || "حدث خطأ غير متوقع";
    return Promise.reject(new Error(message));
  }
);

export default api;
