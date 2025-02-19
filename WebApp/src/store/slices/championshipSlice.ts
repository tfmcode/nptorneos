import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getChampionships,
  createChampionship,
  updateChampionship,
  deleteChampionship,
} from "../../api/championshipService";
import { Championship, ChampionshipInput } from "../../types/championship";

// Estado inicial
const initialState = {
  championships: [] as Championship[],
  loading: false,
  error: null as string | null,
};

// Async Thunks
export const fetchChampionships = createAsyncThunk(
  "championships/fetchChampionships",
  async () => {
    return await getChampionships();
  }
);

export const saveChampionshipThunk = createAsyncThunk(
  "championships/saveChampionshipThunk",
  async (championshipData: ChampionshipInput & { _id?: string }, thunkAPI) => {
    const updatedChampionship = championshipData._id
      ? await updateChampionship(championshipData._id, championshipData)
      : await createChampionship(championshipData);

    if (!updatedChampionship) {
      throw new Error("No se pudo guardar el campeonato");
    }

    // 🔥 Después de guardar, recargamos la lista de campeonatos
    await thunkAPI.dispatch(fetchChampionships());

    return updatedChampionship;
  }
);

export const removeChampionship = createAsyncThunk(
  "championships/removeChampionship",
  async (id: string, thunkAPI) => {
    await deleteChampionship(id);
    // 🔥 Después de eliminar, recargamos la lista de campeonatos
    await thunkAPI.dispatch(fetchChampionships());
    return id;
  }
);

// Slice de campeonatos
const championshipSlice = createSlice({
  name: "championships",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChampionships.pending, (state) => {
        state.loading = true;
        state.error = null; // 🔥 Limpiamos error antes de nueva petición
      })
      .addCase(fetchChampionships.fulfilled, (state, action) => {
        state.loading = false;
        state.championships = action.payload;
      })
      .addCase(fetchChampionships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al obtener campeonatos.";
      })
      .addCase(saveChampionshipThunk.fulfilled, (state) => {
        state.loading = false; // 🔥 No mutamos directamente, usamos fetchChampionships
      })
      .addCase(removeChampionship.fulfilled, (state) => {
        state.loading = false; // 🔥 No necesitamos modificar el array manualmente
      });
  },
});

export default championshipSlice.reducer;
