// src/store/slices/consentimientosSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Consentimiento } from "../../types/consentimientos";
import {
  getConsentimientos,
  getConsentimientoById,
  deleteConsentimiento,
} from "../../api/consentimientosService";
import { AxiosError } from "axios";

interface ConsentimientosState {
  consentimientos: Consentimiento[];
  consentimientoActual: Consentimiento | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

const initialState: ConsentimientosState = {
  consentimientos: [],
  consentimientoActual: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
};

export const fetchConsentimientos = createAsyncThunk(
  "consentimientos/fetchConsentimientos",
  async (
    {
      page,
      limit,
      searchTerm,
    }: { page: number; limit: number; searchTerm?: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await getConsentimientos(page, limit, searchTerm || "");
      return data;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message ?? "Error al cargar consentimientos"
      );
    }
  }
);

export const fetchConsentimientoById = createAsyncThunk(
  "consentimientos/fetchConsentimientoById",
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await getConsentimientoById(id);
      return data;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message ?? "Error al obtener consentimiento"
      );
    }
  }
);

export const removeConsentimiento = createAsyncThunk(
  "consentimientos/removeConsentimiento",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteConsentimiento(id);
      return id;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message ?? "Error al eliminar consentimiento"
      );
    }
  }
);

const consentimientosSlice = createSlice({
  name: "consentimientos",
  initialState,
  reducers: {
    setPage(state, action) {
      state.page = action.payload;
    },
    setLimit(state, action) {
      state.limit = action.payload;
    },
    clearConsentimientoActual(state) {
      state.consentimientoActual = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchConsentimientos
      .addCase(fetchConsentimientos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    .addCase(fetchConsentimientos.fulfilled, (state, action) => {
    state.loading = false;
    state.consentimientos = action.payload.consentimientos ?? [];
    state.total = action.payload.total ?? 0;
    state.page = action.payload.page ?? 1;
    state.limit = action.payload.limit ?? 10;
})

      .addCase(fetchConsentimientos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchConsentimientoById
      .addCase(fetchConsentimientoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConsentimientoById.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchConsentimientoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeConsentimiento.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeConsentimiento.fulfilled, (state, action) => {
        state.loading = false;
        state.consentimientos = state.consentimientos.filter(
          (c) => c.id !== action.payload
        );
      })
      .addCase(removeConsentimiento.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPage, setLimit, clearConsentimientoActual } =
  consentimientosSlice.actions;

export default consentimientosSlice.reducer;
