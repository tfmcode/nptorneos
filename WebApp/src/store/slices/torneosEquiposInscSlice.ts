import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getTorneosEquiposInsc,
  saveTorneosEquiposInsc,
  deleteTorneosEquiposInsc,
  getTorneosEquiposInscByTorneo,
  getTorneosEquiposInscByEquipo,
} from "../../api/torneosEquiposInscService";
import {
  TorneosEquiposInsc,
  TorneosEquiposInscInput,
} from "../../types/torneosEquiposInsc";

const initialState = {
  inscripciones: [] as TorneosEquiposInsc[],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null as string | null,
};

export const fetchTorneosEquiposInsc = createAsyncThunk(
  "torneosEquiposInsc/fetchTorneosEquiposInsc",
  async (
    {
      page,
      limit,
      searchTerm,
    }: { page: number; limit: number; searchTerm: string },
    { rejectWithValue }
  ) => {
    try {
      return await getTorneosEquiposInsc(page, limit, searchTerm);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener inscripciones."
      );
    }
  }
);

export const fetchTorneosEquiposInscByTorneo = createAsyncThunk(
  "torneosEquiposInsc/fetchTorneosEquiposInscByTorneo",
  async (idtorneo: number, { rejectWithValue }) => {
    try {
      return await getTorneosEquiposInscByTorneo(idtorneo);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener inscripciones del torneo."
      );
    }
  }
);

export const fetchTorneosEquiposInscByEquipo = createAsyncThunk(
  "torneosEquiposInsc/fetchTorneosEquiposInscByEquipo",
  async (idequipo: number, { rejectWithValue }) => {
    try {
      return await getTorneosEquiposInscByEquipo(idequipo);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener inscripciones del equipo."
      );
    }
  }
);

export const saveTorneosEquiposInscThunk = createAsyncThunk(
  "torneosEquiposInsc/saveTorneosEquiposInsc",
  async (
    inscripcionData: TorneosEquiposInscInput & { id?: number },
    { rejectWithValue }
  ) => {
    try {
      return await saveTorneosEquiposInsc(inscripcionData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar inscripción."
      );
    }
  }
);

export const removeTorneosEquiposInsc = createAsyncThunk(
  "torneosEquiposInsc/removeTorneosEquiposInsc",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteTorneosEquiposInsc(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar inscripción."
      );
    }
  }
);

const torneosEquiposInscSlice = createSlice({
  name: "torneosEquiposInsc",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTorneosEquiposInsc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTorneosEquiposInsc.fulfilled, (state, action) => {
        state.loading = false;
        state.inscripciones = action.payload.inscripciones;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchTorneosEquiposInsc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchTorneosEquiposInscByTorneo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTorneosEquiposInscByTorneo.fulfilled, (state, action) => {
        state.loading = false;
        state.inscripciones = action.payload;
      })
      .addCase(fetchTorneosEquiposInscByTorneo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchTorneosEquiposInscByEquipo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTorneosEquiposInscByEquipo.fulfilled, (state, action) => {
        state.loading = false;
        state.inscripciones = action.payload;
      })
      .addCase(fetchTorneosEquiposInscByEquipo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(saveTorneosEquiposInscThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (!updated || !updated.id) return;

        const idx = state.inscripciones.findIndex((i) => i.id === updated.id);
        if (idx !== -1) {
          state.inscripciones[idx] = updated;
        } else {
          state.inscripciones.unshift(updated);
        }
      })
      .addCase(saveTorneosEquiposInscThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveTorneosEquiposInscThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(removeTorneosEquiposInsc.fulfilled, (state, action) => {
        state.loading = false;
        state.inscripciones = state.inscripciones.filter(
          (i) => i.id !== action.payload
        );
      })
      .addCase(removeTorneosEquiposInsc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTorneosEquiposInsc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default torneosEquiposInscSlice.reducer;
