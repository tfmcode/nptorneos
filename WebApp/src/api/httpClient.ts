import axios from "axios";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";

const API = axios.create({
  baseURL: "http://localhost:5001",
  headers: { "Content-Type": "application/json" },
});

// ✅ Agregar el token automáticamente en cada petición protegida
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔥 Manejo automático de errores de autenticación
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      store.dispatch(logout());
      // ❌ En lugar de redirigir forzosamente, podemos usar un evento global o un contexto.
    }
    return Promise.reject(error);
  }
);

export default API;
