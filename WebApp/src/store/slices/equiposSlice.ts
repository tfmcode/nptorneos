import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getEquipos, saveEquipo, deleteEquipo } from "../../api/equiposService";
import { Equipo, EquipoInput } from "../../types/equipos";

const initialState = {
  equipos: [] as Equipo[],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null as string | null,
};

export const fetchEquipos = createAsyncThunk(
  "equipos/fetchEquipos",
  async (
    {
      page,
      limit,
      searchTerm,
    }: { page: number; limit: number; searchTerm: string },
    { rejectWithValue }
  ) => {
    try {
      return await getEquipos(page, limit, searchTerm);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener equipos."
      );
    }
  }
);

export const saveEquipoThunk = createAsyncThunk(
  "equipos/saveEquipo",
  async (equipoData: EquipoInput & { id?: number }, { rejectWithValue }) => {
    try {
      return await saveEquipo(equipoData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar equipo."
      );
    }
  }
);

export const removeEquipo = createAsyncThunk(
  "equipos/removeEquipo",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteEquipo(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar equipo."
      );
    }
  }
);

const equiposSlice = createSlice({
  name: "equipos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEquipos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipos.fulfilled, (state, action) => {
        state.loading = false;
        state.equipos = action.payload.equipos;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchEquipos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(saveEquipoThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (!updated || !updated.id) return;

        const idx = state.equipos.findIndex((e) => e.id === updated.id);
        if (idx !== -1) {
          state.equipos[idx] = updated;
        } else {
          state.equipos.unshift(updated);
        }
      })

      .addCase(saveEquipoThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveEquipoThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(removeEquipo.fulfilled, (state, action) => {
        state.loading = false;
        state.equipos = state.equipos.filter((e) => e.id !== action.payload);
      })
      .addCase(removeEquipo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeEquipo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default equiposSlice.reducer;
