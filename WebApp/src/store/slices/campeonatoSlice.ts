import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCampeonatos,
  saveCampeonato,
  deleteCampeonato,
} from "../../api/campeonatosService";
import { Campeonato, CampeonatoInput } from "../../types/campeonato";

const initialState = {
  campeonatos: [] as Campeonato[],
  loading: false,
  error: null as string | null,
};

export const fetchCampeonatos = createAsyncThunk(
  "campeonatos/fetchCampeonatos",
  async (_, { rejectWithValue }) => {
    try {
      return await getCampeonatos();
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener campeonatos."
      );
    }
  }
);

export const saveCampeonatoThunk = createAsyncThunk(
  "campeonatos/saveCampeonato",
  async (
    campeonatoData: CampeonatoInput & { id?: number },
    { rejectWithValue }
  ) => {
    try {
      return await saveCampeonato(campeonatoData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar campeonato."
      );
    }
  }
);

export const removeCampeonato = createAsyncThunk(
  "campeonatos/removeCampeonato",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteCampeonato(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar campeonato."
      );
    }
  }
);

const campeonatoSlice = createSlice({
  name: "campeonatos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampeonatos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampeonatos.fulfilled, (state, action) => {
        state.loading = false;
        state.campeonatos = action.payload;
      })
      .addCase(fetchCampeonatos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(saveCampeonatoThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCampeonato = action.payload;
        if (!updatedCampeonato || !updatedCampeonato.id) return;

        const index = state.campeonatos.findIndex(
          (c) => c.id === updatedCampeonato.id
        );
        if (index !== -1) {
          state.campeonatos[index] = updatedCampeonato;
        } else {
          state.campeonatos.unshift(updatedCampeonato);
        }
      })
      .addCase(saveCampeonatoThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveCampeonatoThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(removeCampeonato.fulfilled, (state, action) => {
        state.loading = false;
        state.campeonatos = state.campeonatos.filter(
          (c) => c.id !== action.payload
        );
      })
      .addCase(removeCampeonato.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCampeonato.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default campeonatoSlice.reducer;
