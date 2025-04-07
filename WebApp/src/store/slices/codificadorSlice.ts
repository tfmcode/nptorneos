import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCodificadores,
  saveCodificador,
  deleteCodificador,
} from "../../api/codificadoresService";
import { Codificador, CodificadorInput } from "../../types/codificador";

const initialState = {
  codificadores: [] as Codificador[],
  loading: false,
  error: null as string | null,
};

export const fetchCodificadores = createAsyncThunk(
  "codificadores/fetchCodificadores",
  async (_, { rejectWithValue }) => {
    try {
      return await getCodificadores();
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const saveCodificadorThunk = createAsyncThunk(
  "codificadores/saveCodificador",
  async (codificadorData: CodificadorInput, { rejectWithValue }) => {
    try {
      return await saveCodificador(codificadorData);
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const removeCodificador = createAsyncThunk(
  "codificadores/removeCodificador",
  async (
    { id, idcodificador }: { id: number; idcodificador: number },
    { rejectWithValue }
  ) => {
    try {
      await deleteCodificador(id, idcodificador);
      return { id, idcodificador };
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const codificadorSlice = createSlice({
  name: "codificadores",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCodificadores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCodificadores.fulfilled, (state, action) => {
        state.loading = false;
        state.codificadores = action.payload;
      })
      .addCase(fetchCodificadores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(saveCodificadorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveCodificadorThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (!updated?.id || !updated?.idcodificador) return;

        const index = state.codificadores.findIndex(
          (c) =>
            c.id === updated.id && c.idcodificador === updated.idcodificador
        );
        if (index !== -1) {
          state.codificadores[index] = updated;
        } else {
          state.codificadores.unshift(updated);
        }
      })
      .addCase(saveCodificadorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(removeCodificador.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCodificador.fulfilled, (state, action) => {
        state.loading = false;
        state.codificadores = state.codificadores.filter(
          (c) =>
            !(
              c.id === action.payload.id &&
              c.idcodificador === action.payload.idcodificador
            )
        );
      })
      .addCase(removeCodificador.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default codificadorSlice.reducer;
