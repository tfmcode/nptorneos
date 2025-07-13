import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getInscripcionesJugadores,
  getInscripcionesJugadoresByInscripcion,
  saveInscripcionJugador,
  deleteInscripcionJugador,
} from "../../api/inscripcionesJugadoresService";
import { InscripcionJugador } from "../../types/inscripcionesJugadores";

const initialState = {
  inscripcionesJugadores: [] as InscripcionJugador[],
  loading: false,
  error: null as string | null,
};

export const fetchInscripcionesJugadores = createAsyncThunk(
  "inscripcionesJugadores/fetchInscripcionesJugadores",
  async (_, { rejectWithValue }) => {
    try {
      return await getInscripcionesJugadores();
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message ||
          "Error al obtener jugadores de inscripciones."
      );
    }
  }
);

export const fetchInscripcionesJugadoresByInscripcion = createAsyncThunk(
  "inscripcionesJugadores/fetchInscripcionesJugadoresByInscripcion",
  async (idinscrip: number, { rejectWithValue }) => {
    try {
      return await getInscripcionesJugadoresByInscripcion(idinscrip);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message ||
          "Error al obtener jugadores de la inscripción."
      );
    }
  }
);

export const saveInscripcionJugadorThunk = createAsyncThunk(
  "inscripcionesJugadores/saveInscripcionJugador",
  async (inscripcionJugadorData: InscripcionJugador, { rejectWithValue }) => {
    try {
      return await saveInscripcionJugador(inscripcionJugadorData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar jugador de inscripción."
      );
    }
  }
);

export const removeInscripcionJugador = createAsyncThunk(
  "inscripcionesJugadores/removeInscripcionJugador",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteInscripcionJugador(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar jugador de inscripción."
      );
    }
  }
);

const inscripcionesJugadoresSlice = createSlice({
  name: "inscripcionesJugadores",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInscripcionesJugadores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInscripcionesJugadores.fulfilled, (state, action) => {
        state.loading = false;
        state.inscripcionesJugadores = action.payload;
      })
      .addCase(fetchInscripcionesJugadores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchInscripcionesJugadoresByInscripcion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchInscripcionesJugadoresByInscripcion.fulfilled,
        (state, action) => {
          state.loading = false;
          state.inscripcionesJugadores = action.payload;
        }
      )
      .addCase(
        fetchInscripcionesJugadoresByInscripcion.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        }
      )
      .addCase(saveInscripcionJugadorThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedInscripcionJugador = action.payload;
        if (!updatedInscripcionJugador || !updatedInscripcionJugador.id) return;

        const index = state.inscripcionesJugadores.findIndex(
          (ij) => ij.id === updatedInscripcionJugador.id
        );
        if (index !== -1) {
          state.inscripcionesJugadores[index] = updatedInscripcionJugador;
        } else {
          state.inscripcionesJugadores.unshift(updatedInscripcionJugador);
        }
      })
      .addCase(saveInscripcionJugadorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveInscripcionJugadorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeInscripcionJugador.fulfilled, (state, action) => {
        state.loading = false;
        state.inscripcionesJugadores = state.inscripcionesJugadores.filter(
          (ij) => ij.id !== action.payload
        );
      })
      .addCase(removeInscripcionJugador.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeInscripcionJugador.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default inscripcionesJugadoresSlice.reducer;
