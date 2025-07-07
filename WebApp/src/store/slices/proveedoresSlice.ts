import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProveedores,
  saveProveedor,
  deleteProveedor,
} from "../../api/proveedoresService";
import { Proveedor, ProveedorInput } from "../../types/proveedores";

const initialState = {
  proveedores: [] as Proveedor[],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null as string | null,
};

export const fetchProveedores = createAsyncThunk(
  "proveedores/fetchProveedores",
  async (
    {
      page,
      limit,
      searchTerm,
    }: { page: number; limit: number; searchTerm: string },
    { rejectWithValue }
  ) => {
    try {
      return await getProveedores(page, limit, searchTerm);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener proveedores."
      );
    }
  }
);

export const saveProveedorThunk = createAsyncThunk(
  "proveedores/saveProveedor",
  async (
    proveedorData: ProveedorInput & { id?: number },
    { rejectWithValue }
  ) => {
    try {
      return await saveProveedor(proveedorData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar proveedor."
      );
    }
  }
);

export const removeProveedor = createAsyncThunk(
  "proveedores/removeProveedor",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteProveedor(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar proveedor."
      );
    }
  }
);

const proveedorSlice = createSlice({
  name: "proveedores",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProveedores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProveedores.fulfilled, (state, action) => {
        state.loading = false;
        state.proveedores = action.payload.proveedores;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchProveedores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveProveedorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveProveedorThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProveedor = action.payload;
        if (!updatedProveedor || !updatedProveedor.id) return;

        const index = state.proveedores.findIndex(
          (p) => p.id === updatedProveedor.id
        );
        if (index !== -1) {
          state.proveedores[index] = updatedProveedor;
        } else {
          state.proveedores.unshift(updatedProveedor);
        }
      })
      .addCase(saveProveedorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeProveedor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProveedor.fulfilled, (state, action) => {
        state.loading = false;
        state.proveedores = state.proveedores.filter(
          (p) => p.id !== action.payload
        );
      })
      .addCase(removeProveedor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default proveedorSlice.reducer;
