import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getInscripciones,
  saveInscripcion,
  deleteInscripcion,
  updateEquipoAsoc,
} from "../../api/inscripcionesService";
import { Inscripcion, InscripcionInput } from "../../types/inscripciones";

const initialState = {
  inscripciones: [] as Inscripcion[],
  loading: false,
  error: null as string | null,
  page: 1,
  limit: 10,
  total: 0,
};

export const fetchInscripciones = createAsyncThunk(
  "inscripciones/fetchInscripciones",
  async (
    {
      page,
      limit,
      searchTerm,
    }: { page: number; limit: number; searchTerm: string },
    { rejectWithValue }
  ) => {
    try {
      return await getInscripciones(page, limit, searchTerm);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al obtener inscripciones."
      );
    }
  }
);

export const updateEquipoAsocThunk = createAsyncThunk(
  "inscripciones/updateEquipoAsoc",
  async (
    { id, idequipo }: { id: number; idequipo: number },
    { rejectWithValue }
  ) => {
    try {
      return await updateEquipoAsoc(id, idequipo);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al actualizar equipo asociado."
      );
    }
  }
);

export const saveInscripcionThunk = createAsyncThunk(
  "inscripciones/saveInscripcion",
  async (
    inscripcionData: InscripcionInput & { id?: number },
    { rejectWithValue }
  ) => {
    try {
      return await saveInscripcion(inscripcionData);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al guardar inscripción."
      );
    }
  }
);

export const removeInscripcion = createAsyncThunk(
  "inscripciones/removeInscripcion",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteInscripcion(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Error al eliminar inscripción."
      );
    }
  }
);

const inscripcionSlice = createSlice({
  name: "inscripciones",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInscripciones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInscripciones.fulfilled, (state, action) => {
        state.loading = false;
        state.inscripciones = action.payload.inscripciones;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchInscripciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveInscripcionThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedInscripcion = action.payload;
        if (!updatedInscripcion || !updatedInscripcion.id) return;

        const index = state.inscripciones.findIndex(
          (i) => i.id === updatedInscripcion.id
        );
        if (index !== -1) {
          state.inscripciones[index] = updatedInscripcion;
        } else {
          state.inscripciones.unshift(updatedInscripcion);
        }
      })
      .addCase(saveInscripcionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveInscripcionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeInscripcion.fulfilled, (state, action) => {
        state.loading = false;
        state.inscripciones = state.inscripciones.filter(
          (i) => i.id !== action.payload
        );
      })
      .addCase(removeInscripcion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeInscripcion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateEquipoAsocThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedInscripcion = action.payload.inscripcion;
        if (!updatedInscripcion || !updatedInscripcion.id) return;

        const index = state.inscripciones.findIndex(
          (i) => i.id === updatedInscripcion.id
        );
        if (index !== -1) {
          state.inscripciones[index] = updatedInscripcion;
        } else {
          state.inscripciones.unshift(updatedInscripcion);
        }
      })
      .addCase(updateEquipoAsocThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEquipoAsocThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default inscripcionSlice.reducer;
