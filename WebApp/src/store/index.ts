import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice"; // 🔥 Agrega el authReducer

export const store = configureStore({
  reducer: {
    users: userReducer,
    auth: authReducer, // 🔥 Agregamos el reducer de autenticación
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
