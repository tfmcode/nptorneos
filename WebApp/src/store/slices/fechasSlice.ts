import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFechas, saveFecha, deleteFecha } from "../../api/fechasService";
import { FechaResumen, FechaInput } from "../../types/fechas";

const initialState = {
  fechas: [] as FechaResumen[],
  loading: false,
  error: null as string | null,
};

export const fetchFechas = createAsyncThunk(
  "fechas/fetchFechas",
  async (_, { rejectWithValue }) => {
    try {
      return await getFechas();
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener fechas."
      );
    }
  }
);

export const saveFechaThunk = createAsyncThunk(
  "fechas/saveFecha",
  async (data: FechaInput & { id?: number }, { rejectWithValue }) => {
    try {
      return await saveFecha(data);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar fecha."
      );
    }
  }
);

export const removeFecha = createAsyncThunk(
  "fechas/removeFecha",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteFecha(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar fecha."
      );
    }
  }
);

const fechasSlice = createSlice({
  name: "fechas",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFechas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFechas.fulfilled, (state, action) => {
        state.loading = false;
        state.fechas = action.payload;
      })
      .addCase(fetchFechas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(saveFechaThunk.fulfilled, (state) => {
        state.loading = false;
        // 🔁 Refetch externo sugerido, no insertamos nada acá
      })
      .addCase(saveFechaThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveFechaThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(removeFecha.fulfilled, (state, action) => {
        state.loading = false;
        state.fechas = state.fechas.filter((f) => f.id !== action.payload);
      })
      .addCase(removeFecha.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFecha.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default fechasSlice.reducer;
