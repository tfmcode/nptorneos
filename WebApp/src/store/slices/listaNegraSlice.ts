import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getListaNegra,
  createRegistroListaNegra,
  updateRegistroListaNegra,
  deleteRegistroListaNegra,
} from "../../api/listaNegraService";
import { ListaNegra, ListaNegraInput } from "../../types/listaNegra";

const initialState = {
  registros: [] as ListaNegra[],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null as string | null,
  searchTerm: "",
};

export const fetchListaNegra = createAsyncThunk(
  "listaNegra/fetchListaNegra",
  async (
    {
      page,
      limit,
      searchTerm,
    }: { page: number; limit: number; searchTerm: string },
    { rejectWithValue }
  ) => {
    try {
      return await getListaNegra(page, limit, searchTerm);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener registros de lista negra."
      );
    }
  }
);

export const saveRegistroListaNegra = createAsyncThunk(
  "listaNegra/saveRegistro",
  async (data: ListaNegraInput & { id?: number }, { rejectWithValue }) => {
    try {
      return data.id
        ? await updateRegistroListaNegra(data.id, data)
        : await createRegistroListaNegra(data);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar registro."
      );
    }
  }
);

export const removeRegistroListaNegra = createAsyncThunk(
  "listaNegra/removeRegistro",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteRegistroListaNegra(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar registro."
      );
    }
  }
);

const listaNegraSlice = createSlice({
  name: "listaNegra",
  initialState,
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListaNegra.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListaNegra.fulfilled, (state, action) => {
        state.loading = false;
        state.registros = action.payload.registros;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchListaNegra.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(saveRegistroListaNegra.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (!updated || !updated.id) return;

        const index = state.registros.findIndex((r) => r.id === updated.id);
        if (index !== -1) {
          state.registros[index] = updated;
        } else {
          state.registros.unshift(updated);
        }
      })
      .addCase(saveRegistroListaNegra.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveRegistroListaNegra.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(removeRegistroListaNegra.fulfilled, (state, action) => {
        state.loading = false;
        state.registros = state.registros.filter(
          (r) => r.id !== action.payload
        );
      })
      .addCase(removeRegistroListaNegra.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeRegistroListaNegra.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchTerm } = listaNegraSlice.actions;
export default listaNegraSlice.reducer;
