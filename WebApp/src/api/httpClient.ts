import axios from "axios";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.error("⚠️ Error: VITE_API_URL no está definido en el archivo .env");
  throw new Error("Falta la variable de entorno VITE_API_URL");
}

const API = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default API;
