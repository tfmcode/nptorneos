import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getVenues, saveVenue, deleteVenue } from "../../api/venueService";
import { Venue, VenueInput } from "../../types/venue";

// Estado inicial seguro
const initialState = {
  venues: [] as Venue[], // ✅ Siempre inicializa como array vacío
  loading: false,
  error: null as string | null,
};

// 🔹 Obtener todas las sedes con paginación
export const fetchVenues = createAsyncThunk(
  "venues/fetchVenues",
  async (
    { page, limit }: { page: number; limit: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getVenues(page, limit);
      return response; // ✅ Ya accede directamente a `venues` en `venueService`
    } catch {
      return rejectWithValue("Error al obtener sedes.");
    }
  }
);

// 🔹 Crear o actualizar sede
export const saveVenueThunk = createAsyncThunk(
  "venues/saveVenue",
  async (venueData: VenueInput & { _id?: string }, { rejectWithValue }) => {
    try {
      return await saveVenue(venueData);
    } catch {
      return rejectWithValue("Error al guardar sede.");
    }
  }
);

// 🔹 Eliminar sede
export const removeVenue = createAsyncThunk(
  "venues/removeVenue",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteVenue(id);
      return id;
    } catch {
      return rejectWithValue("Error al eliminar sede.");
    }
  }
);

// 🔥 Slice de sedes con mejoras
const venueSlice = createSlice({
  name: "venues",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVenues.pending, (state) => {
        state.loading = true;
        state.error = null; // ✅ Limpia errores previos
      })
      .addCase(fetchVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = action.payload; // ✅ Ahora almacena `venues` correctamente
      })
      .addCase(fetchVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveVenueThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.venues.push(action.payload); // ✅ Agrega la nueva sede directamente
      })
      .addCase(removeVenue.fulfilled, (state, action) => {
        state.venues = state.venues.filter(
          (venue) => venue._id !== action.payload
        );
      })
      .addCase(removeVenue.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default venueSlice.reducer;
