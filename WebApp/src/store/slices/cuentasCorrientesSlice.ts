import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCuentaCorrienteEquipo,
  getCuentasCorrientesGeneral,
} from "../../api/cuentasCorrientesService";
import {
  CuentaCorrienteEquipo,
  ResumenCuentaCorriente,
} from "../../types/cuentasCorrientes";

interface CuentasCorrientesState {
  cuentaEquipo: CuentaCorrienteEquipo | null;
  resumenes: ResumenCuentaCorriente[];
  loading: boolean;
  error: string | null;
}

const initialState: CuentasCorrientesState = {
  cuentaEquipo: null,
  resumenes: [],
  loading: false,
  error: null,
};

// Thunk para obtener cuenta corriente de un equipo
export const fetchCuentaCorrienteEquipo = createAsyncThunk(
  "cuentasCorrientes/fetchCuentaCorrienteEquipo",
  async (idequipo: number, { rejectWithValue }) => {
    try {
      return await getCuentaCorrienteEquipo(idequipo);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener cuenta corriente."
      );
    }
  }
);

// Thunk para obtener resumen de todas las cuentas corrientes
export const fetchCuentasCorrientesGeneral = createAsyncThunk(
  "cuentasCorrientes/fetchCuentasCorrientesGeneral",
  async (_, { rejectWithValue }) => {
    try {
      return await getCuentasCorrientesGeneral();
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener cuentas corrientes."
      );
    }
  }
);

const cuentasCorrientesSlice = createSlice({
  name: "cuentasCorrientes",
  initialState,
  reducers: {
    clearCuentaEquipo: (state) => {
      state.cuentaEquipo = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cuenta corriente de equipo
      .addCase(fetchCuentaCorrienteEquipo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCuentaCorrienteEquipo.fulfilled, (state, action) => {
        state.loading = false;
        state.cuentaEquipo = action.payload;
      })
      .addCase(fetchCuentaCorrienteEquipo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch cuentas corrientes general
      .addCase(fetchCuentasCorrientesGeneral.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCuentasCorrientesGeneral.fulfilled, (state, action) => {
        state.loading = false;
        state.resumenes = action.payload;
      })
      .addCase(fetchCuentasCorrientesGeneral.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCuentaEquipo, clearError } = cuentasCorrientesSlice.actions;
export default cuentasCorrientesSlice.reducer;
