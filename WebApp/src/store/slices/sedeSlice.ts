import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSedes, saveSede, deleteSede } from "../../api/sedesService";
import { Sede, SedeInput } from "../../types/sede";

// Estado inicial
const initialState = {
  sedes: [] as Sede[],
  loading: false,
  error: null as string | null,
};

// 🔍 Obtener sedes
export const fetchSedes = createAsyncThunk(
  "sedes/fetchSedes",
  async (_, { rejectWithValue }) => {
    try {
      return await getSedes();
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener sedes."
      );
    }
  }
);

// 🆕 Crear o actualizar sede
export const saveSedeThunk = createAsyncThunk(
  "sedes/saveSede",
  async (sedeData: SedeInput & { id?: number }, { rejectWithValue }) => {
    try {
      return await saveSede(sedeData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar sede."
      );
    }
  }
);

// ❌ Eliminar sede (Soft Delete)
export const removeSede = createAsyncThunk(
  "sedes/removeSede",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteSede(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar sede."
      );
    }
  }
);

// 🏗 Slice de sedes
const sedeSlice = createSlice({
  name: "sedes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSedes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSedes.fulfilled, (state, action) => {
        state.loading = false;
        state.sedes = action.payload;
      })
      .addCase(fetchSedes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(saveSedeThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedSede = action.payload;
        if (!updatedSede || !updatedSede.id) return;

        const index = state.sedes.findIndex((s) => s.id === updatedSede.id);
        if (index !== -1) {
          state.sedes[index] = updatedSede;
        } else {
          state.sedes.unshift(updatedSede);
        }
      })
      .addCase(saveSedeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSedeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(removeSede.fulfilled, (state, action) => {
        state.loading = false;
        state.sedes = state.sedes.filter((sede) => sede.id !== action.payload);
      })
      .addCase(removeSede.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeSede.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default sedeSlice.reducer;
