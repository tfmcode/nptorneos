import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMenuTorneosByOpcion,
  saveMenuTorneo,
  deleteMenuTorneo,
} from "../../api/menuTorneosService";
import { MenuTorneo, MenuTorneoInput } from "../../types/menuTorneos";

interface MenuTorneosState {
  menutorneos: MenuTorneo[];
  loading: boolean;
  error: string | null;
}

const initialState: MenuTorneosState = {
  menutorneos: [],
  loading: false,
  error: null,
};

// Fetch menús por opción
export const fetchMenuTorneosByOpcion = createAsyncThunk(
  "menutorneos/fetchMenuTorneosByOpcion",
  async (idopcion: number, { rejectWithValue }) => {
    try {
      return await getMenuTorneosByOpcion(idopcion);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener menús de torneos."
      );
    }
  }
);

// Guardar (crear o actualizar) menú torneo
export const saveMenuTorneoThunk = createAsyncThunk(
  "menutorneos/saveMenuTorneo",
  async (
    menuTorneoData: MenuTorneoInput & { ordenAnterior?: number },
    { rejectWithValue }
  ) => {
    try {
      return await saveMenuTorneo(menuTorneoData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar menú de torneo."
      );
    }
  }
);

// Eliminar menú torneo
export const removeMenuTorneo = createAsyncThunk(
  "menutorneos/removeMenuTorneo",
  async (
    { idopcion, orden }: { idopcion: number; orden: number },
    { rejectWithValue }
  ) => {
    try {
      await deleteMenuTorneo(idopcion, orden);
      return { idopcion, orden };
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar menú de torneo."
      );
    }
  }
);

const menuTorneosSlice = createSlice({
  name: "menutorneos",
  initialState,
  reducers: {
    clearMenuTorneos: (state) => {
      state.menutorneos = [];
      state.error = null;
    },
    setMenuTorneosError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchMenuTorneosByOpcion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuTorneosByOpcion.fulfilled, (state, action) => {
        state.loading = false;
        state.menutorneos = action.payload;
      })
      .addCase(fetchMenuTorneosByOpcion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save
      .addCase(saveMenuTorneoThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveMenuTorneoThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedMenu = action.payload;
        if (
          !updatedMenu ||
          updatedMenu.idopcion === undefined ||
          updatedMenu.orden === undefined
        )
          return;

        const index = state.menutorneos.findIndex(
          (m) =>
            m.idopcion === updatedMenu.idopcion && m.orden === updatedMenu.orden
        );

        if (index !== -1) {
          state.menutorneos[index] = updatedMenu;
        } else {
          state.menutorneos.unshift(updatedMenu);
        }
      })
      .addCase(saveMenuTorneoThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Remove
      .addCase(removeMenuTorneo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeMenuTorneo.fulfilled, (state, action) => {
        state.loading = false;
        const { idopcion, orden } = action.payload;
        state.menutorneos = state.menutorneos.filter(
          (m) => !(m.idopcion === idopcion && m.orden === orden)
        );
      })
      .addCase(removeMenuTorneo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMenuTorneos, setMenuTorneosError } =
  menuTorneosSlice.actions;
export default menuTorneosSlice.reducer;
