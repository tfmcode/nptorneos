import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getEquipoJugadoresByEquipo,
  saveEquipoJugador,
  deleteEquipoJugador,
} from "../../api/equiposJugadoresService";
import {
  EquipoJugador,
  EquipoJugadorInput,
} from "../../types/equiposJugadores";

interface EquiposJugadoresState {
  equiposJugadores: EquipoJugador[];
  loading: boolean;
  error: string | null;
}

const initialState: EquiposJugadoresState = {
  equiposJugadores: [],
  loading: false,
  error: null,
};

export const fetchEquipoJugadoresByEquipo = createAsyncThunk(
  "equiposJugadores/fetchEquipoJugadoresByEquipo",
  async (idequipo: number, { rejectWithValue }) => {
    try {
      return await getEquipoJugadoresByEquipo(idequipo);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener jugadores del equipo."
      );
    }
  }
);

export const saveEquipoJugadorThunk = createAsyncThunk(
  "equiposJugadores/saveEquipoJugador",
  async (
    jugadorData: EquipoJugadorInput & { id?: number },
    { rejectWithValue }
  ) => {
    try {
      return await saveEquipoJugador(jugadorData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar jugador del equipo."
      );
    }
  }
);

export const removeEquipoJugador = createAsyncThunk(
  "equiposJugadores/removeEquipoJugador",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteEquipoJugador(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar jugador del equipo."
      );
    }
  }
);

const equiposJugadoresSlice = createSlice({
  name: "equiposJugadores",
  initialState,
  reducers: {
    clearEquiposJugadores: (state) => {
      state.equiposJugadores = [];
      state.error = null;
    },
    setEquiposJugadoresError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEquipoJugadoresByEquipo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipoJugadoresByEquipo.fulfilled, (state, action) => {
        state.loading = false;
        state.equiposJugadores = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchEquipoJugadoresByEquipo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveEquipoJugadorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveEquipoJugadorThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedJugador = action.payload;
        if (!updatedJugador || !updatedJugador.id) return;
        const index = state.equiposJugadores.findIndex(
          (j) => j.id === updatedJugador.id
        );
        if (index !== -1) {
          state.equiposJugadores[index] = updatedJugador;
        } else {
          state.equiposJugadores.unshift(updatedJugador);
        }
      })
      .addCase(saveEquipoJugadorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeEquipoJugador.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeEquipoJugador.fulfilled, (state, action) => {
        state.loading = false;
        state.equiposJugadores = state.equiposJugadores.filter(
          (j) => j.id !== action.payload
        );
      })
      .addCase(removeEquipoJugador.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearEquiposJugadores, setEquiposJugadoresError } =
  equiposJugadoresSlice.actions;
export default equiposJugadoresSlice.reducer;
