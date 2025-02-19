import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice";
import championshipReducer from "./slices/championshipSlice";
import playerReducer from "./slices/playerSlice"; // ✅ Importamos el reducer de jugadores

// 🔥 Configuración de Redux Store con middleware personalizado
export const store = configureStore({
  reducer: {
    users: userReducer,
    auth: authReducer,
    championships: championshipReducer,
    players: playerReducer, // ✅ Agregamos el reducer de jugadores
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
