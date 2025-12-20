import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFacturas,
  saveFactura,
  deleteFactura,
} from "../../api/facturasService";
import { Factura, FacturaInput } from "../../types/factura";

const initialState = {
  facturas: [] as Factura[],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  loading: false,
  error: null as string | null,
};

export const fetchFacturas = createAsyncThunk(
  "facturas/fetchFacturas",
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
    { rejectWithValue }
  ) => {
    try {
      return await getFacturas(page, limit, searchTerm, fechaDesde, fechaHasta);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener facturas."
      );
    }
  }
);

export const saveFacturaThunk = createAsyncThunk(
  "facturas/saveFactura",
  async (facturaData: FacturaInput & { id?: number }, { rejectWithValue }) => {
    try {
      return await saveFactura(facturaData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar factura."
      );
    }
  }
);

export const removeFactura = createAsyncThunk(
  "facturas/removeFactura",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteFactura(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar factura."
      );
    }
  }
);

const facturaSlice = createSlice({
  name: "facturas",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFacturas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFacturas.fulfilled, (state, action) => {
        state.loading = false;
        state.facturas = action.payload.facturas;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchFacturas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(saveFacturaThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedFactura = action.payload;
        if (!updatedFactura || !updatedFactura.id) return;

        const index = state.facturas.findIndex(
          (s) => s.id === updatedFactura.id
        );
        if (index !== -1) {
          state.facturas[index] = updatedFactura;
        } else {
          state.facturas.unshift(updatedFactura);
        }
      })
      .addCase(saveFacturaThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveFacturaThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(removeFactura.fulfilled, (state, action) => {
        state.loading = false;
        state.facturas = state.facturas.filter(
          (factura) => factura.id !== action.payload
        );
      })
      .addCase(removeFactura.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFactura.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default facturaSlice.reducer;
