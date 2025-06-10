import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getZonasByTorneo, saveZona, deleteZona } from "../../api/zonasService";
import { Zona, ZonaInput } from "../../types/zonas";

interface ZonasState {
  zonas: Zona[];
  loading: boolean;
  error: string | null;
}

const initialState: ZonasState = {
  zonas: [],
  loading: false,
  error: null,
};

export const fetchZonasByTorneo = createAsyncThunk(
  "zonas/fetchZonasByTorneo",
  async (idTorneo: number, { rejectWithValue }) => {
    try {
      return await getZonasByTorneo(idTorneo);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener zonas."
      );
    }
  }
);

export const saveZonaThunk = createAsyncThunk(
  "zonas/saveZona",
  async (zonaData: ZonaInput & { id?: number }, { rejectWithValue }) => {
    try {
      return await saveZona(zonaData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar zona."
      );
    }
  }
);

export const removeZona = createAsyncThunk(
  "zonas/removeZona",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteZona(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar zona."
      );
    }
  }
);

const zonasSlice = createSlice({
  name: "zonas",
  initialState,
  reducers: {
    clearZonas: (state) => {
      state.zonas = [];
      state.error = null;
    },
    setZonasError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch zonas by torneo
      .addCase(fetchZonasByTorneo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchZonasByTorneo.fulfilled, (state, action) => {
        state.loading = false;
        state.zonas = action.payload;
      })
      .addCase(fetchZonasByTorneo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save zona
      .addCase(saveZonaThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveZonaThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedZona = action.payload;
        if (!updatedZona || !updatedZona.id) return;

        const index = state.zonas.findIndex((z) => z.id === updatedZona.id);
        if (index !== -1) {
          state.zonas[index] = updatedZona;
        } else {
          state.zonas.unshift(updatedZona);
        }
      })
      .addCase(saveZonaThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Remove zona
      .addCase(removeZona.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeZona.fulfilled, (state, action) => {
        state.loading = false;
        state.zonas = state.zonas.filter((z) => z.id !== action.payload);
      })
      .addCase(removeZona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearZonas, setZonasError } = zonasSlice.actions;
export default zonasSlice.reducer;
