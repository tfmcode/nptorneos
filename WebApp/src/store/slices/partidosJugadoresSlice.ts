import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PartidoJugadorInput,
  PartidoJugadorExtendido,
} from "../../types/partidosJugadores";
import {
  getJugadoresPorEquipo,
  savePartidoJugador,
  deletePartidoJugador, // ← Agregada la importación
} from "../../api/partidosJugadoresService";

interface PartidoJugadoresState {
  jugadores: PartidoJugadorExtendido[];
  loading: boolean;
  error: string | null;
}

const initialState: PartidoJugadoresState = {
  jugadores: [],
  loading: false,
  error: null,
};

export const fetchPartidoJugadores = createAsyncThunk<
  PartidoJugadorExtendido[],
  { idpartido: number; idequipo: number },
  { rejectValue: string }
>("partidoJugadores/fetch", async ({ idpartido, idequipo }, thunkAPI) => {
  try {
    return await getJugadoresPorEquipo(idpartido, idequipo);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return thunkAPI.rejectWithValue(error.message);
    }
    return thunkAPI.rejectWithValue("Error desconocido.");
  }
});

export const savePartidoJugadorThunk = createAsyncThunk<
  void,
  { idpartido: number; idequipo: number; data: PartidoJugadorInput },
  { rejectValue: string }
>("partidoJugadores/save", async ({ idpartido, idequipo, data }, thunkAPI) => {
  try {
    await savePartidoJugador(idpartido, idequipo, data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return thunkAPI.rejectWithValue(error.message);
    }
    return thunkAPI.rejectWithValue("Error desconocido.");
  }
});

// ✅ Nuevo thunk para eliminar jugador
export const deletePartidoJugadorThunk = createAsyncThunk<
  number, // Retorna el ID del jugador eliminado
  { idpartido: number; idequipo: number; idjugador: number },
  { rejectValue: string }
>(
  "partidoJugadores/delete",
  async ({ idpartido, idequipo, idjugador }, thunkAPI) => {
    try {
      await deletePartidoJugador(idpartido, idequipo, idjugador);
      return idjugador; // Retornamos el ID para poder actualizar el estado local
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Error desconocido.");
    }
  }
);

const partidosJugadoresSlice = createSlice({
  name: "partidoJugadores",
  initialState,
  reducers: {
    setPartidoJugadoresError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // ✅ Reducer para actualizar un jugador específico sin hacer fetch completo
    updateJugadorInState: (
      state,
      action: PayloadAction<{
        idjugador: number;
        updates: Partial<PartidoJugadorExtendido>;
      }>
    ) => {
      const { idjugador, updates } = action.payload;
      const jugadorIndex = state.jugadores.findIndex(
        (j) => j.idjugador === idjugador
      );
      if (jugadorIndex !== -1) {
        state.jugadores[jugadorIndex] = {
          ...state.jugadores[jugadorIndex],
          ...updates,
        };
      }
    },
    // ✅ Reducer para limpiar errores
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch jugadores
      .addCase(fetchPartidoJugadores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartidoJugadores.fulfilled, (state, action) => {
        state.loading = false;
        state.jugadores = action.payload;
      })
      .addCase(fetchPartidoJugadores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al cargar los jugadores.";
      })

      // Save jugador
      .addCase(savePartidoJugadorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePartidoJugadorThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(savePartidoJugadorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al guardar el jugador.";
      })

      // ✅ Delete jugador - Nuevos casos agregados
      .addCase(deletePartidoJugadorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePartidoJugadorThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Remover el jugador del estado local
        state.jugadores = state.jugadores.filter(
          (jugador) => jugador.idjugador !== action.payload
        );
      })
      .addCase(deletePartidoJugadorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al eliminar el jugador.";
      });
  },
});

export const { setPartidoJugadoresError, updateJugadorInState, clearError } =
  partidosJugadoresSlice.actions;

export default partidosJugadoresSlice.reducer;
