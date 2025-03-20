import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getJugadores,
  createJugador,
  updateJugador,
  deleteJugador,
} from "../../api/jugadoresService";
import { Jugador, JugadorInput } from "../../types/jugadores";

// Estado inicial
const initialState = {
  jugadores: [] as Jugador[],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null as string | null,
  searchTerm: "",
};

// 🔍 Obtener jugadores con paginación y búsqueda
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
      return rejectWithValue(
        (error as Error).message || "Error al obtener jugadores."
      );
    }
  }
);

// 🆕 Crear o actualizar jugador
export const saveJugadorThunk = createAsyncThunk(
  "jugadores/saveJugador",
  async (jugadorData: JugadorInput & { id?: number }, { rejectWithValue }) => {
    try {
      return jugadorData.id
        ? await updateJugador(jugadorData.id, jugadorData)
        : await createJugador(jugadorData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar jugador."
      );
    }
  }
);

// ❌ Eliminar jugador (Soft Delete)
export const removeJugador = createAsyncThunk(
  "jugadores/removeJugador",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteJugador(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar jugador."
      );
    }
  }
);

// 🏗 Slice de jugadores
const jugadoresSlice = createSlice({
  name: "jugadores",
  initialState,
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJugadores.pending, (state) => {
        state.loading = true;
        state.error = null;
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
        state.error = action.payload as string;
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
      })
      .addCase(saveJugadorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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
      })
      .addCase(removeJugador.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchTerm } = jugadoresSlice.actions;
export default jugadoresSlice.reducer;
