import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice"; // 🔥 Agrega el authReducer
import championshipReducer from "./slices/championshipSlice"; // 🔥 Agrega el championshipReducer

export const store = configureStore({
  reducer: {
    users: userReducer,
    auth: authReducer,
    championships: championshipReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
