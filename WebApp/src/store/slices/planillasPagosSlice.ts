// ==========================================
// COPIAR ARCHIVOS SEGÚN COMENTARIOS
// ==========================================

// ==========================================
// ARCHIVO: store/slices/planillasPagoSlice.ts
// ==========================================

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getPlanillasByFiltros as getPlanillasByFiltrosService,
  getPlanillaCompleta as getPlanillaCompletaService,
  createPlanilla as createPlanillaService,
  updatePlanilla as updatePlanillaService,
  cerrarPlanilla as cerrarPlanillaService,
  contabilizarPlanilla as contabilizarPlanillaService,
  deletePlanilla as deletePlanillaService,
} from "../../api/planillasPagosService";
import {
  PlanillaPago,
  PlanillaPagoInput,
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
  async (data: PlanillaPagoInput, { rejectWithValue }) => {
    try {
      return await createPlanillaService(data);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al crear planilla."
      );
    }
  }
);

export const updatePlanilla = createAsyncThunk(
  "planillasPago/update",
  async (
    { id, data }: { id: number; data: Partial<PlanillaPago> },
    { rejectWithValue }
  ) => {
    try {
      return await updatePlanillaService(id, data);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al actualizar planilla."
      );
    }
  }
);

export const cerrarPlanilla = createAsyncThunk(
  "planillasPago/cerrar",
  async (id: number, { rejectWithValue }) => {
    try {
      return await cerrarPlanillaService(id);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al cerrar planilla."
      );
    }
  }
);

export const contabilizarPlanilla = createAsyncThunk(
  "planillasPago/contabilizar",
  async (
    { id, idusuario }: { id: number; idusuario: number },
    { rejectWithValue }
  ) => {
    try {
      return await contabilizarPlanillaService(id, idusuario);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al contabilizar planilla."
      );
    }
  }
);

export const deletePlanilla = createAsyncThunk(
  "planillasPago/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await deletePlanillaService(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar planilla."
      );
    }
  }
);

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
      .addCase(updatePlanilla.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlanilla.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPlanilla = action.payload;
        if (updatedPlanilla && updatedPlanilla.id) {
          const index = state.planillas.findIndex(
            (p) => p.id === updatedPlanilla.id
          );
          if (index !== -1) {
            state.planillas[index] = updatedPlanilla;
          }
        }
      })
      .addCase(updatePlanilla.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cerrarPlanilla.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cerrarPlanilla.fulfilled, (state, action) => {
        state.loading = false;
        const cerrada = action.payload;
        if (cerrada && cerrada.id) {
          const index = state.planillas.findIndex((p) => p.id === cerrada.id);
          if (index !== -1) {
            state.planillas[index] = cerrada;
          }
        }
      })
      .addCase(cerrarPlanilla.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(contabilizarPlanilla.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(contabilizarPlanilla.fulfilled, (state, action) => {
        state.loading = false;
        const contabilizada = action.payload;
        if (contabilizada && contabilizada.id) {
          const index = state.planillas.findIndex(
            (p) => p.id === contabilizada.id
          );
          if (index !== -1) {
            state.planillas[index] = contabilizada;
          }
        }
      })
      .addCase(contabilizarPlanilla.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePlanilla.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlanilla.fulfilled, (state, action) => {
        state.loading = false;
        state.planillas = state.planillas.filter(
          (p) => p.id !== action.payload
        );
      })
      .addCase(deletePlanilla.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPlanillas, clearPlanillaActual, setPlanillasError } =
  planillasPagoSlice.actions;

export default planillasPagoSlice.reducer;

// ==========================================
// FIN DEL SLICE - Los componentes están en el siguiente mensaje por límite de caracteres
// ==========================================
