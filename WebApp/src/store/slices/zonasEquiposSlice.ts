import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getZonasEquiposByTorneo,
  saveZonaEquipo,
  deleteZonaEquipo,
} from "../../api/zonasEquiposService";
import { ZonaEquipo, ZonaEquipoInput } from "../../types/zonasEquipos";

interface ZonasEquiposState {
  zonasEquipos: ZonaEquipo[];
  loading: boolean;
  error: string | null;
}

const initialState: ZonasEquiposState = {
  zonasEquipos: [],
  loading: false,
  error: null,
};

export const fetchZonasEquiposByTorneo = createAsyncThunk(
  "zonasEquipos/fetchZonasEquiposByTorneo",
  async (idTorneo: number, { rejectWithValue }) => {
    try {
      return await getZonasEquiposByTorneo(idTorneo);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener equipos de zona."
      );
    }
  }
);

export const saveZonaEquipoThunk = createAsyncThunk(
  "zonasEquipos/saveZonaEquipo",
  async (
    zonaEquipoData: ZonaEquipoInput & { id?: number },
    { rejectWithValue }
  ) => {
    try {
      return await saveZonaEquipo(zonaEquipoData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar equipo de zona."
      );
    }
  }
);

export const removeZonaEquipo = createAsyncThunk(
  "zonasEquipos/removeZonaEquipo",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteZonaEquipo(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar equipo de zona."
      );
    }
  }
);

const zonasEquiposSlice = createSlice({
  name: "zonasEquipos",
  initialState,
  reducers: {
    clearZonasEquipos: (state) => {
      state.zonasEquipos = [];
      state.error = null;
    },
    setZonasEquiposError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch equipos de zona by torneo
      .addCase(fetchZonasEquiposByTorneo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchZonasEquiposByTorneo.fulfilled, (state, action) => {
        state.loading = false;
        state.zonasEquipos = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchZonasEquiposByTorneo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save equipo de zona
      .addCase(saveZonaEquipoThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveZonaEquipoThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedZonaEquipo = action.payload;
        if (!updatedZonaEquipo || !updatedZonaEquipo.id) return;

        const index = state.zonasEquipos.findIndex(
          (z) => z.id === updatedZonaEquipo.id
        );
        if (index !== -1) {
          state.zonasEquipos[index] = updatedZonaEquipo;
        } else {
          state.zonasEquipos.unshift(updatedZonaEquipo);
        }
      })
      .addCase(saveZonaEquipoThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Remove equipo de zona
      .addCase(removeZonaEquipo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeZonaEquipo.fulfilled, (state, action) => {
        state.loading = false;
        state.zonasEquipos = state.zonasEquipos.filter(
          (z) => z.id !== action.payload
        );
      })
      .addCase(removeZonaEquipo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearZonasEquipos, setZonasEquiposError } =
  zonasEquiposSlice.actions;
export default zonasEquiposSlice.reducer;
