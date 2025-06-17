import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getPartidosByZona,
  getPartido,
  savePartido,
  deletePartido,
} from "../../api/partidoService";
import { Partido } from "../../types/partidos";

interface PartidosState {
  partidos: Partido[];
  loading: boolean;
  error: string | null;
}

const initialState: PartidosState = {
  partidos: [],
  loading: false,
  error: null,
};

export const fetchPartidosByZona = createAsyncThunk(
  "partidos/fetchPartidosByZona",
  async (idZona: number, { rejectWithValue }) => {
    try {
      return await getPartidosByZona(idZona);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener partidos."
      );
    }
  }
);

export const fetchPartido = createAsyncThunk(
  "partidos/fetchPartido",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getPartido(id);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener partido."
      );
    }
  }
);

export const savePartidoThunk = createAsyncThunk(
  "partidos/savePartido",
  async (
    partidoData: Partial<Partido> & { id?: number },
    { rejectWithValue }
  ) => {
    try {
      return await savePartido(partidoData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar partido."
      );
    }
  }
);

export const removePartido = createAsyncThunk(
  "partidos/removePartido",
  async (id: number, { rejectWithValue }) => {
    try {
      await deletePartido(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar partido."
      );
    }
  }
);

const partidoSlice = createSlice({
  name: "partidos",
  initialState,
  reducers: {
    clearPartidos: (state) => {
      state.partidos = [];
      state.error = null;
    },
    setPartidosError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch partidos by zona
      .addCase(fetchPartidosByZona.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartidosByZona.fulfilled, (state, action) => {
        state.loading = false;
        state.partidos = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPartidosByZona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save partido
      .addCase(savePartidoThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePartidoThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPartido = action.payload;
        if (!updatedPartido || !updatedPartido.id) return;

        const index = state.partidos.findIndex(
          (p) => p.id === updatedPartido.id
        );
        if (index !== -1) {
          state.partidos[index] = updatedPartido;
        } else {
          state.partidos.unshift(updatedPartido);
        }
      })
      .addCase(savePartidoThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Remove partido
      .addCase(removePartido.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removePartido.fulfilled, (state, action) => {
        state.loading = false;
        state.partidos = state.partidos.filter((p) => p.id !== action.payload);
      })
      .addCase(removePartido.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPartidos, setPartidosError } = partidoSlice.actions;
export default partidoSlice.reducer;
