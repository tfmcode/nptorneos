import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import usuarioReducer from "./slices/usuarioSlice"; // 🔹 Cambiado de userReducer a usuarioReducer
import campeonatoReducer from "./slices/campeonatoSlice";
import jugadoresReducer from "./slices/jugadoresSlice";
import sedeReducer from "./slices/sedeSlice";
import codificadorReducer from "./slices/codificadorSlice";

// 🔥 Configuración de Redux Store con middleware personalizado
export const store = configureStore({
  reducer: {
    usuarios: usuarioReducer, // 🔹 Reemplazamos `users` → `usuarios`
    auth: authReducer,
    campeonatos: campeonatoReducer,
    jugadores: jugadoresReducer,
    sedes: sedeReducer,
    codificadores: codificadorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ Evita errores con datos no serializables
    }),
  devTools: process.env.NODE_ENV !== "production", // ✅ Habilita Redux DevTools solo en desarrollo
});

// ✅ Tipado del estado y el dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
