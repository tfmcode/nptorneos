import axios from "axios";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";

const baseURL = import.meta.env.VITE_API_URL; // ej: http://localhost:5001

if (!baseURL) {
  console.error("⚠️ VITE_API_URL no está definido en .env(.local)");
  throw new Error("Falta la variable de entorno VITE_API_URL");
}

const API = axios.create({
  baseURL, // <- sin /api acá, porque ya va en cada llamada
  headers: { "Content-Type": "application/json" },
  // withCredentials: true, // si usás cookies de sesión
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default API;
