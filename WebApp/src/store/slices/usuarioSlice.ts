import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUsuarios,
  saveUsuario,
  deleteUsuario,
} from "../../api/usuarioService";
import { Usuario, UsuarioInput } from "../../types/usuario";

const initialState = {
  usuarios: [] as Usuario[],
  loading: false,
  error: null as string | null,
};

export const fetchUsuarios = createAsyncThunk(
  "usuarios/fetchUsuarios",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUsuarios();
      return response ?? [];
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener usuarios."
      );
    }
  }
);

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
          : 1,

        habilitado:
          usuarioData.habilitado !== undefined
            ? (usuarioData.habilitado as 0 | 1)
            : 0,
      };

      const response = await saveUsuario(usuarioPayload);
      return response ?? null;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar usuario."
      );
    }
  }
);

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

const usuarioSlice = createSlice({
  name: "usuarios",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsuarios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsuarios.fulfilled, (state, action) => {
        state.loading = false;
        state.usuarios = action.payload ?? [];
      })
      .addCase(fetchUsuarios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

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
          state.usuarios[index] = updatedUsuario;
        } else {
          state.usuarios = [updatedUsuario, ...state.usuarios];
        }
      })
      .addCase(saveUsuarioThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(removeUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeUsuario.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload) return;
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
