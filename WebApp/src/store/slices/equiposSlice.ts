import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getEquipos,
  createEquipo,
  updateEquipo,
  deleteEquipo,
} from "../../api/equiposService";
import { Equipo, EquipoInput } from "../../types/equipos";

interface EquiposState {
  equipos: Equipo[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

const initialState: EquiposState = {
  equipos: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
  searchTerm: "",
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
      return equipoData.id
        ? await updateEquipo(equipoData.id, equipoData)
        : await createEquipo(equipoData);
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
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
  },
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

      .addCase(saveEquipoThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveEquipoThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEquipo = action.payload;
        if (!updatedEquipo || !updatedEquipo.id) return;

        const index = state.equipos.findIndex((e) => e.id === updatedEquipo.id);
        if (index !== -1) {
          state.equipos[index] = updatedEquipo;
        } else {
          state.equipos.unshift(updatedEquipo);
        }
      })
      .addCase(saveEquipoThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(removeEquipo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeEquipo.fulfilled, (state, action) => {
        state.loading = false;
        state.equipos = state.equipos.filter(
          (equipo) => equipo.id !== action.payload
        );
      })
      .addCase(removeEquipo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchTerm } = equiposSlice.actions;
export default equiposSlice.reducer;
