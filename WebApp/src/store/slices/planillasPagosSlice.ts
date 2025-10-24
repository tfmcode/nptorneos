// Ubicación: WebApp/src/store/slices/planillasPagoSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getPlanillasByFiltros as getPlanillasByFiltrosService,
  getPlanillaCompleta as getPlanillaCompletaService,
  createPlanilla as createPlanillaService,
  cerrarPlanilla as cerrarPlanillaService,
  cerrarCaja as cerrarCajaService,
} from "../../api/planillasPagosService";
import {
  PlanillaPago,
  PlanillaCompleta,
  PlanillasFiltros,
} from "../../types/planillasPago";

interface PlanillasPagoState {
  planillas: PlanillaPago[];
  planillaActual: PlanillaCompleta | null;
  loading: boolean;
  error: string | null;
}

const initialState: PlanillasPagoState = {
  planillas: [],
  planillaActual: null,
  loading: false,
  error: null,
};

// ========================================
// THUNKS - PLANILLAS PRINCIPALES
// ========================================

export const getPlanillasByFiltros = createAsyncThunk(
  "planillasPago/fetchByFiltros",
  async (filtros: PlanillasFiltros, { rejectWithValue }) => {
    try {
      const result = await getPlanillasByFiltrosService(filtros);
      return result || [];
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener planillas."
      );
    }
  }
);

export const getPlanillaCompleta = createAsyncThunk(
  "planillasPago/fetchCompleta",
  async (idfecha: number, { rejectWithValue }) => {
    try {
      return await getPlanillaCompletaService(idfecha);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener planilla completa."
      );
    }
  }
);

export const createPlanilla = createAsyncThunk(
  "planillasPago/create",
  async (idfecha: number, { rejectWithValue }) => {
    try {
      return await createPlanillaService(idfecha);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al crear planilla."
      );
    }
  }
);

export const cerrarPlanilla = createAsyncThunk(
  "planillasPago/cerrar",
  async (
    { idfecha, idprofesor }: { idfecha: number; idprofesor: number },
    { rejectWithValue }
  ) => {
    try {
      await cerrarPlanillaService(idfecha, idprofesor);
      return idfecha;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al cerrar planilla."
      );
    }
  }
);

export const cerrarCaja = createAsyncThunk(
  "planillasPago/cerrar-caja",
  async (
    { idfecha, idusuario }: { idfecha: number; idusuario: number },
    { rejectWithValue }
  ) => {
    try {
      await cerrarCajaService(idfecha, idusuario);
      return idfecha;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al cerrar caja."
      );
    }
  }
);

// ========================================
// SLICE
// ========================================

const planillasPagoSlice = createSlice({
  name: "planillasPago",
  initialState,
  reducers: {
    clearPlanillas: (state) => {
      state.planillas = [];
      state.error = null;
    },
    clearPlanillaActual: (state) => {
      state.planillaActual = null;
      state.error = null;
    },
    setPlanillasError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // getPlanillasByFiltros
      .addCase(getPlanillasByFiltros.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlanillasByFiltros.fulfilled, (state, action) => {
        state.loading = false;
        state.planillas = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getPlanillasByFiltros.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // getPlanillaCompleta
      .addCase(getPlanillaCompleta.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlanillaCompleta.fulfilled, (state, action) => {
        state.loading = false;
        state.planillaActual = action.payload;
      })
      .addCase(getPlanillaCompleta.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // createPlanilla
      .addCase(createPlanilla.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlanilla.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.planillas.unshift(action.payload);
        }
      })
      .addCase(createPlanilla.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // cerrarPlanilla
      .addCase(cerrarPlanilla.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cerrarPlanilla.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload es el idfecha
        if (state.planillaActual?.planilla.idfecha === action.payload) {
          state.planillaActual.planilla.fhcierre = new Date().toISOString();
        }
        // Actualizar en la lista también
        const index = state.planillas.findIndex(
          (p) => p.idfecha === action.payload
        );
        if (index !== -1) {
          state.planillas[index].fhcierre = new Date().toISOString();
        }
      })
      .addCase(cerrarPlanilla.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // cerrarCaja
      .addCase(cerrarCaja.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cerrarCaja.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload es el idfecha
        if (state.planillaActual?.planilla.idfecha === action.payload) {
          state.planillaActual.planilla.fhcierrecaja = new Date().toISOString();
        }
        // Actualizar en la lista también
        const index = state.planillas.findIndex(
          (p) => p.idfecha === action.payload
        );
        if (index !== -1) {
          state.planillas[index].fhcierrecaja = new Date().toISOString();
        }
      })
      .addCase(cerrarCaja.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPlanillas, clearPlanillaActual, setPlanillasError } =
  planillasPagoSlice.actions;

export default planillasPagoSlice.reducer;
