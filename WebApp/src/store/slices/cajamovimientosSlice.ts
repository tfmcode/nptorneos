import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCajaMovimientos, saveCajaMovimiento, deleteCajaMovimiento } from "../../api/cajamovimientosService";
import { CajaMovimiento } from "../../types/cajamovimiento";

const initialState = {
  cajamovimientos: [] as CajaMovimiento[],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  loading: false,
  error: null as string | null,
};

export const fetchCajaMovimientos = createAsyncThunk(
  "cajamovimientos/fetchCajaMovimientos",
  async (
    {
      page,
      limit,
      searchTerm,
      fechaDesde,
      fechaHasta,
    }: {
      page: number;
      limit: number;
      searchTerm: string;
      fechaDesde: Date;
      fechaHasta: Date;
    },
    { rejectWithValue }) => {
    try {
      return await getCajaMovimientos(page, limit, searchTerm, fechaDesde, fechaHasta);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener el movimiento de caja."
      );
    }
  }
);

export const saveCajaMovimientoThunk = createAsyncThunk(
  "cajamovimientos/saveCajaMovimiento",
  async (cajamovimientoData: CajaMovimiento & { id?: number }, { rejectWithValue }) => {
    try {
      return await saveCajaMovimiento(cajamovimientoData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar movimiento de caja."
      );
    }
  }
);

export const removeCajaMovimiento = createAsyncThunk(
  "cajamovimientos/removeCajaMovimiento",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteCajaMovimiento(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar movimiento de caja."
      );
    }
  }
);

// 🏗 Slice de cajamovimientos
const cajamovimientoslice = createSlice({
  name: "cajamovimientos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCajaMovimientos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCajaMovimientos.fulfilled, (state, action) => {
        state.loading = false;
        state.cajamovimientos = action.payload.cajamovimientos;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchCajaMovimientos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(saveCajaMovimientoThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCajaMovimiento = action.payload;
        if (!updatedCajaMovimiento || !updatedCajaMovimiento.id) return;

        const index = state.cajamovimientos.findIndex((s) => s.id === updatedCajaMovimiento.id);
        if (index !== -1) {
          state.cajamovimientos[index] = updatedCajaMovimiento;
        } else {
          state.cajamovimientos.unshift(updatedCajaMovimiento);
        }
      })
      .addCase(saveCajaMovimientoThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveCajaMovimientoThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(removeCajaMovimiento.fulfilled, (state, action) => {
        state.loading = false;
        state.cajamovimientos = state.cajamovimientos.filter((cajamovimiento) => cajamovimiento.id !== action.payload);
      })
      .addCase(removeCajaMovimiento.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCajaMovimiento.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default cajamovimientoslice.reducer;
