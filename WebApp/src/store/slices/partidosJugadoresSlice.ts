import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PartidoJugadorInput,
  PartidoJugadorExtendido,
} from "../../types/partidosJugadores";
import {
  getJugadoresPorEquipo,
  savePartidoJugador,
} from "../../api/partidosJugadoresService";

interface PartidoJugadoresState {
  jugadores: PartidoJugadorExtendido[];
  loading: boolean;
  error: string | null;
}

const initialState: PartidoJugadoresState = {
  jugadores: [],
  loading: false,
  error: null,
};

export const fetchPartidoJugadores = createAsyncThunk<
  PartidoJugadorExtendido[],
  { idpartido: number; idequipo: number },
  { rejectValue: string }
>("partidoJugadores/fetch", async ({ idpartido, idequipo }, thunkAPI) => {
  try {
    return await getJugadoresPorEquipo(idpartido, idequipo);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return thunkAPI.rejectWithValue(error.message);
    }
    return thunkAPI.rejectWithValue("Error desconocido.");
  }
});

export const savePartidoJugadorThunk = createAsyncThunk<
  void,
  { idpartido: number; idequipo: number; data: PartidoJugadorInput },
  { rejectValue: string }
>("partidoJugadores/save", async ({ idpartido, idequipo, data }, thunkAPI) => {
  try {
    await savePartidoJugador(idpartido, idequipo, data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return thunkAPI.rejectWithValue(error.message);
    }
    return thunkAPI.rejectWithValue("Error desconocido.");
  }
});

const partidosJugadoresSlice = createSlice({
  name: "partidoJugadores",
  initialState,
  reducers: {
    setPartidoJugadoresError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPartidoJugadores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartidoJugadores.fulfilled, (state, action) => {
        state.loading = false;
        state.jugadores = action.payload;
      })
      .addCase(fetchPartidoJugadores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al cargar los jugadores.";
      })
      .addCase(savePartidoJugadorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePartidoJugadorThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(savePartidoJugadorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al guardar el jugador.";
      });
  },
});

export const { setPartidoJugadoresError } = partidosJugadoresSlice.actions;
export default partidosJugadoresSlice.reducer;
