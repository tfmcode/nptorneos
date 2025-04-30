import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUsuario } from "../../api/authService";
import { Usuario } from "../../types/usuario";
import { AxiosError } from "axios";

interface AuthState {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Recuperar usuario y token desde localStorage
const token = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

const initialState: AuthState = {
  user: token && storedUser ? (JSON.parse(storedUser) as Usuario) : null,
  token: token ?? null,
  loading: false,
  error: null,
};

interface APIErrorResponse {
  message?: string;
}

export const login = createAsyncThunk<
  { user: Usuario; token: string },
  { email: string; contrasenia: string },
  { rejectValue: string }
>("auth/login", async (credentials, thunkAPI) => {
  try {
    const response = await loginUsuario(credentials);

    if (response.token && response.user) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

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
      state.error = null;
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
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Credenciales incorrectas"; 
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
