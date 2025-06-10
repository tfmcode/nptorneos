import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getTorneos, saveTorneo, deleteTorneo } from "../../api/torneosService";
import { Torneo, TorneoInput } from "../../types/torneos";

const initialState = {
  torneos: [] as Torneo[],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null as string | null,
};

export const fetchTorneos = createAsyncThunk(
  "torneos/fetchTorneos",
  async (
    {
      page,
      limit,
      searchTerm,
    }: { page: number; limit: number; searchTerm: string },
    { rejectWithValue }
  ) => {
    try {
      return await getTorneos(page, limit, searchTerm);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener torneos."
      );
    }
  }
);

export const saveTorneoThunk = createAsyncThunk(
  "torneos/saveTorneo",
  async (torneoData: TorneoInput & { id?: number }, { rejectWithValue }) => {
    try {
      return await saveTorneo(torneoData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar torneo."
      );
    }
  }
);

export const removeTorneo = createAsyncThunk(
  "torneos/removeTorneo",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteTorneo(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar torneo."
      );
    }
  }
);

const torneoSlice = createSlice({
  name: "torneos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTorneos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTorneos.fulfilled, (state, action) => {
        state.loading = false;
        state.torneos = action.payload.torneos;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchTorneos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveTorneoThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTorneo = action.payload;
        if (!updatedTorneo || !updatedTorneo.id) return;

        const index = state.torneos.findIndex((c) => c.id === updatedTorneo.id);
        if (index !== -1) {
          state.torneos[index] = updatedTorneo;
        } else {
          state.torneos.unshift(updatedTorneo);
        }
      })
      .addCase(saveTorneoThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveTorneoThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeTorneo.fulfilled, (state, action) => {
        state.loading = false;
        state.torneos = state.torneos.filter((c) => c.id !== action.payload);
      })
      .addCase(removeTorneo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTorneo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default torneoSlice.reducer;
