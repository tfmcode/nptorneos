import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getTorneoImagenesByTorneo,
  saveTorneoImagen,
  deleteTorneoImagen,
} from "../../api/torneosImagenesService";
import { TorneosImagen, TorneosImagenInput } from "../../types/torneosImagenes";

interface TorneosImagenState {
  imagenes: TorneosImagen[];
  loading: boolean;
  error: string | null;
}

const initialState: TorneosImagenState = {
  imagenes: [],
  loading: false,
  error: null,
};

export const fetchTorneoImagenesByTorneo = createAsyncThunk(
  "torneosImagen/fetchTorneoImagenesByTorneo",
  async (idTorneo: number, { rejectWithValue }) => {
    try {
      return await getTorneoImagenesByTorneo(idTorneo);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener imágenes del torneo."
      );
    }
  }
);

export const saveTorneoImagenThunk = createAsyncThunk(
  "torneosImagen/saveTorneoImagen",
  async (
    imagenData: Partial<TorneosImagenInput> & { id?: number },
    { rejectWithValue }
  ) => {
    try {
      return await saveTorneoImagen(imagenData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar imagen del torneo."
      );
    }
  }
);

export const removeTorneoImagen = createAsyncThunk(
  "torneosImagen/removeTorneoImagen",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteTorneoImagen(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar imagen del torneo."
      );
    }
  }
);

const torneosImagenSlice = createSlice({
  name: "torneosImagen",
  initialState,
  reducers: {
    clearTorneoImagenes: (state) => {
      state.imagenes = [];
      state.error = null;
    },
    setTorneoImagenError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch imagenes by torneo
      .addCase(fetchTorneoImagenesByTorneo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTorneoImagenesByTorneo.fulfilled, (state, action) => {
        state.loading = false;
        state.imagenes = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTorneoImagenesByTorneo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save imagen
      .addCase(saveTorneoImagenThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveTorneoImagenThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedImagen = action.payload;
        if (!updatedImagen || !updatedImagen.id) return;

        const index = state.imagenes.findIndex(
          (img) => img.id === updatedImagen.id
        );
        if (index !== -1) {
          state.imagenes[index] = updatedImagen;
        } else {
          state.imagenes.unshift(updatedImagen);
        }
      })
      .addCase(saveTorneoImagenThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Remove imagen
      .addCase(removeTorneoImagen.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTorneoImagen.fulfilled, (state, action) => {
        state.loading = false;
        state.imagenes = state.imagenes.filter(
          (img) => img.id !== action.payload
        );
      })
      .addCase(removeTorneoImagen.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTorneoImagenes, setTorneoImagenError } =
  torneosImagenSlice.actions;
export default torneosImagenSlice.reducer;
