import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "../../api/playerService";
import { Player, PlayerInput } from "../../types/player";

// Estado inicial
const initialState = {
  players: [] as Player[],
  totalPlayers: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null as string | null,
};

// 🔥 Obtener jugadores con paginación y búsqueda
export const fetchPlayers = createAsyncThunk(
  "players/fetchPlayers",
  async ({
    page,
    limit,
    searchTerm,
  }: {
    page: number;
    limit: number;
    searchTerm: string;
  }) => {
    return await getPlayers(page, limit, searchTerm);
  }
);

// 🔥 Guardar o actualizar un jugador
export const savePlayerThunk = createAsyncThunk(
  "players/savePlayerThunk",
  async (playerData: PlayerInput & { _id?: string }, thunkAPI) => {
    const updatedPlayer = playerData._id
      ? await updatePlayer(playerData._id, playerData)
      : await createPlayer(playerData);

    if (!updatedPlayer) {
      throw new Error("No se pudo guardar el jugador.");
    }

    // 🔥 Después de guardar, recargamos la lista de jugadores
    await thunkAPI.dispatch(
      fetchPlayers({ page: 1, limit: 10, searchTerm: "" })
    );

    return updatedPlayer;
  }
);

// 🔥 Eliminar un jugador
export const removePlayer = createAsyncThunk(
  "players/removePlayer",
  async (id: string, thunkAPI) => {
    await deletePlayer(id);
    // 🔥 Después de eliminar, recargamos la lista de jugadores
    await thunkAPI.dispatch(
      fetchPlayers({ page: 1, limit: 10, searchTerm: "" })
    );
    return id;
  }
);

// Slice de jugadores
const playerSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        state.loading = false;
        state.players = action.payload.players;
        state.totalPlayers = action.payload.totalPlayers;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al obtener jugadores.";
      })
      .addCase(savePlayerThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removePlayer.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { setPage } = playerSlice.actions;
export default playerSlice.reducer;
