
import axios from "axios";

// Production: Render backend
// Development: Local backend
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://emp-system-qb81.onrender.com/api"
    : "http://localhost:5000/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ems_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");

    if (
      error.response?.status === 401 &&
      !isAuthCall &&
      localStorage.getItem("ems_token")
    ) {
      localStorage.removeItem("ems_token");
      localStorage.removeItem("ems_user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export const errorMessage = (
  err,
  fallback = "Something went wrong. Please try again."
) => {
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }

  if (err?.code === "ERR_NETWORK") {
    return "Unable to connect to the server. Please check your internet connection and backend URL.";
  }

  return fallback;
};

export default api;
