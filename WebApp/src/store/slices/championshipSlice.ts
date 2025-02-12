import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getChampionships,
  createOrUpdateChampionship,
  deleteChampionship,
} from "../../api/championshipService";
import { Championship, ChampionshipInput } from "../../types/championship";

const initialState = {
  championships: [] as Championship[],
  loading: false,
  error: null as string | null,
};

// 🔹 Obtener todos los campeonatos
export const fetchChampionships = createAsyncThunk(
  "championships/fetch",
  async () => {
    return await getChampionships();
  }
);

// 🔹 Crear o actualizar campeonato y luego refrescar la lista
export const saveChampionship = createAsyncThunk(
  "championships/save",
  async (data: ChampionshipInput & { _id?: string }, thunkAPI) => {
    await createOrUpdateChampionship(data);
    return thunkAPI.dispatch(fetchChampionships()).unwrap(); // 🔥 Refrescar la lista tras crear/editar
  }
);

// 🔹 Eliminar campeonato y actualizar la lista
export const removeChampionship = createAsyncThunk(
  "championships/remove",
  async (id: string, thunkAPI) => {
    await deleteChampionship(id);
    return thunkAPI.dispatch(fetchChampionships()).unwrap(); // 🔥 Refrescar la lista tras eliminar
  }
);

const championshipSlice = createSlice({
  name: "championships",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChampionships.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChampionships.fulfilled, (state, action) => {
        state.loading = false;
        state.championships = action.payload;
      })
      .addCase(fetchChampionships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al obtener campeonatos.";
      })
      .addCase(saveChampionship.fulfilled, (state, action) => {
        state.championships = action.payload; // ✅ Reemplazar con la lista actualizada
      })
      .addCase(removeChampionship.fulfilled, (state, action) => {
        state.championships = action.payload; // ✅ Reemplazar con la lista actualizada
      });
  },
});

export default championshipSlice.reducer;
