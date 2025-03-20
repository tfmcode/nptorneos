import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUsuarios,
  saveUsuario,
  deleteUsuario,
} from "../../api/usuarioService";
import { Usuario, UsuarioInput } from "../../types/usuario";

// Estado inicial
const initialState = {
  usuarios: [] as Usuario[],
  loading: false,
  error: null as string | null,
};

// 🔍 Obtener usuarios
export const fetchUsuarios = createAsyncThunk(
  "usuarios/fetchUsuarios",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUsuarios();
      return response ?? []; // 🔹 Evita que `usuarios` sea `undefined`
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener usuarios."
      );
    }
  }
);

// 🆕 Crear o actualizar usuario
export const saveUsuarioThunk = createAsyncThunk(
  "usuarios/saveUsuario",
  async (
    usuarioData: UsuarioInput & { idusuario?: number },
    { rejectWithValue }
  ) => {
    try {
      const usuarioPayload: UsuarioInput & { idusuario?: number } = {
        ...usuarioData,
        perfil: [1, 2, 3].includes(Number(usuarioData.perfil))
          ? (usuarioData.perfil as 1 | 2 | 3)
          : 1, // ✅ Solo valores permitidos

        habilitado:
          usuarioData.habilitado !== undefined
            ? (usuarioData.habilitado as 0 | 1)
            : 0, // ✅ Solo 0 o 1
      };

      const response = await saveUsuario(usuarioPayload);
      return response ?? null; // 🔹 Asegura que no retorne `undefined`
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar usuario."
      );
    }
  }
);

// ❌ Eliminar usuario (Soft Delete)
export const removeUsuario = createAsyncThunk(
  "usuarios/removeUsuario",
  async (idusuario: number, { rejectWithValue }) => {
    try {
      if (!idusuario) throw new Error("ID de usuario inválido.");
      await deleteUsuario(idusuario);
      return idusuario;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar usuario."
      );
    }
  }
);

// 🏗 Slice de usuarios
const usuarioSlice = createSlice({
  name: "usuarios",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔍 Obtener usuarios
      .addCase(fetchUsuarios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsuarios.fulfilled, (state, action) => {
        state.loading = false;
        state.usuarios = action.payload ?? []; // 🔹 Evita errores si la API devuelve `undefined`
      })
      .addCase(fetchUsuarios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🆕 Crear o actualizar usuario
      .addCase(saveUsuarioThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveUsuarioThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUsuario = action.payload;
        if (!updatedUsuario || !updatedUsuario.idusuario) return;

        const index = state.usuarios.findIndex(
          (u) => u.idusuario === updatedUsuario.idusuario
        );
        if (index !== -1) {
          state.usuarios[index] = updatedUsuario; // ✅ Actualiza usuario existente
        } else {
          state.usuarios = [updatedUsuario, ...state.usuarios]; // ✅ Agrega usuario nuevo al inicio
        }
      })
      .addCase(saveUsuarioThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ❌ Eliminar usuario
      .addCase(removeUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeUsuario.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload) return; // 🔹 Evita eliminar `undefined`
        state.usuarios = state.usuarios.filter(
          (usuario) => usuario.idusuario !== action.payload
        );
      })
      .addCase(removeUsuario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default usuarioSlice.reducer;
