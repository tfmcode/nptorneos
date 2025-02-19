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
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};

// Definimos el tipo de error esperado en la API
interface APIErrorResponse {
  message?: string; // 👈 `message` es opcional
}

// Acción para hacer login
export const login = createAsyncThunk<
  { user: User; token: string }, // ✅ Especificamos el tipo de `fulfilled`
  { email: string; password: string }, // ✅ Definimos los argumentos esperados
  { rejectValue: string } // ✅ Tipamos correctamente el `rejected`
>("auth/login", async (credentials, thunkAPI) => {
  try {
    const response = await loginUser(credentials);
    return response;
  } catch (error) {
    const axiosError = error as AxiosError<APIErrorResponse>;
    return thunkAPI.rejectWithValue(
      axiosError.response?.data?.message ||
        "Error de red o servidor no disponible"
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null; // ✅ Limpiamos el error al cerrar sesión
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Error desconocido"; // ✅ Manejo de errores mejorado
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
