import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getJugadores,
  createJugador,
  updateJugador,
  deleteJugador,
  DuplicateDocumentError,
} from "../../api/jugadoresService";
import { Jugador, JugadorInput } from "../../types/jugadores";

// ✅ Interfaz para el estado con información adicional de error
interface JugadoresState {
  jugadores: Jugador[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  errorType: string | null; // ✅ Nuevo campo para tipo de error
  searchTerm: string;
}

const initialState: JugadoresState = {
  jugadores: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
  errorType: null, // ✅ Inicializar nuevo campo
  searchTerm: "",
};

export const fetchJugadores = createAsyncThunk(
  "jugadores/fetchJugadores",
  async (
    {
      page,
      limit,
      searchTerm,
    }: { page: number; limit: number; searchTerm: string },
    { rejectWithValue }
  ) => {
    try {
      return await getJugadores(page, limit, searchTerm);
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || "Error al obtener jugadores.",
        type: (error as Error).name || "GENERIC_ERROR",
      });
    }
  }
);

export const saveJugadorThunk = createAsyncThunk(
  "jugadores/saveJugador",
  async (jugadorData: JugadorInput & { id?: number }, { rejectWithValue }) => {
    try {
      return jugadorData.id
        ? await updateJugador(jugadorData.id, jugadorData)
        : await createJugador(jugadorData);
    } catch (error: unknown) {
      // ✅ Manejar específicamente el error de documento duplicado
      if (error instanceof DuplicateDocumentError) {
        return rejectWithValue({
          message: error.message,
          type: "DUPLICATE_DOCUMENT",
        });
      }

      return rejectWithValue({
        message: (error as Error).message || "Error al guardar jugador.",
        type: (error as Error).name || "GENERIC_ERROR",
      });
    }
  }
);

export const removeJugador = createAsyncThunk(
  "jugadores/removeJugador",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteJugador(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || "Error al eliminar jugador.",
        type: (error as Error).name || "GENERIC_ERROR",
      });
    }
  }
);

const jugadoresSlice = createSlice({
  name: "jugadores",
  initialState,
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    // ✅ Acción para limpiar errores
    clearError(state) {
      state.error = null;
      state.errorType = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJugadores.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorType = null;
      })
      .addCase(fetchJugadores.fulfilled, (state, action) => {
        state.loading = false;
        state.jugadores = action.payload.jugadores;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchJugadores.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message: string; type: string };
        state.error = payload.message;
        state.errorType = payload.type;
      })

      .addCase(saveJugadorThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedJugador = action.payload;
        if (!updatedJugador || !updatedJugador.id) return;

        const index = state.jugadores.findIndex(
          (j) => j.id === updatedJugador.id
        );
        if (index !== -1) {
          state.jugadores[index] = updatedJugador;
        } else {
          state.jugadores.unshift(updatedJugador);
        }
      })
      .addCase(saveJugadorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorType = null;
      })
      .addCase(saveJugadorThunk.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message: string; type: string };
        state.error = payload.message;
        state.errorType = payload.type;
      })

      .addCase(removeJugador.fulfilled, (state, action) => {
        state.loading = false;
        state.jugadores = state.jugadores.filter(
          (jugador) => jugador.id !== action.payload
        );
      })
      .addCase(removeJugador.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorType = null;
      })
      .addCase(removeJugador.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as { message: string; type: string };
        state.error = payload.message;
        state.errorType = payload.type;
      });
  },
});

export const { setSearchTerm, clearError } = jugadoresSlice.actions;
export default jugadoresSlice.reducer;
