import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSanciones,
  saveSancion,
  deleteSancion,
} from "../../api/sancionesService";
import { Sancion, SancionInput } from "../../types/sanciones";

const initialState = {
  sanciones: [] as Sancion[],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  loading: false,
  error: null as string | null,
};

export const fetchSanciones = createAsyncThunk(
  "sanciones/fetchSanciones",
  async (
    {
      page,
      limit,
      searchTerm,
      startDate,
      endDate,
    }: {
      page: number;
      limit: number;
      searchTerm: string;
      startDate: string;
      endDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await getSanciones(page, limit, searchTerm, startDate, endDate);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener sanciones."
      );
    }
  }
);

export const saveSancionThunk = createAsyncThunk(
  "sanciones/saveSancion",
  async (sancionData: SancionInput & { id?: number }, { rejectWithValue }) => {
    try {
      return await saveSancion(sancionData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar sanción."
      );
    }
  }
);

export const removeSancion = createAsyncThunk(
  "sanciones/removeSancion",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteSancion(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar sanción."
      );
    }
  }
);

const sancionSlice = createSlice({
  name: "sanciones",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSanciones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSanciones.fulfilled, (state, action) => {
        state.loading = false;
        state.sanciones = action.payload.sanciones;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchSanciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveSancionThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedSancion = action.payload;
        if (!updatedSancion || !updatedSancion.id) return;

        const index = state.sanciones.findIndex((s) => s.id === updatedSancion.id);
        if (index !== -1) {
          state.sanciones[index] = updatedSancion;
        } else {
          state.sanciones.unshift(updatedSancion);
        }
      })
      .addCase(saveSancionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSancionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeSancion.fulfilled, (state, action) => {
        state.loading = false;
        state.sanciones = state.sanciones.filter(
          (s) => s.id !== action.payload
        );
      })
      .addCase(removeSancion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeSancion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default sancionSlice.reducer;
