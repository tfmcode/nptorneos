import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser } from "../../api/authService";
import { User } from "../../types/user";
import { AxiosError } from "axios";

// Estado inicial
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};

// Definimos el tipo de error esperado en la API
interface APIErrorResponse {
  message?: string; // 👈 `message` es opcional
}

// Acción para hacer login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await loginUser(credentials);
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<APIErrorResponse>; // ✅ Tipamos correctamente el error
      return thunkAPI.rejectWithValue(
        axiosError.response?.data?.message ||
          "Error de red o servidor no disponible"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Error desconocido";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
