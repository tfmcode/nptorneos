import axios from "axios";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";

// Obtener la baseURL desde las variables de entorno
const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.error("⚠️ Error: VITE_API_URL no está definido en el archivo .env");
  throw new Error("Falta la variable de entorno VITE_API_URL");
}

const API = axios.create({
  baseURL,
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
