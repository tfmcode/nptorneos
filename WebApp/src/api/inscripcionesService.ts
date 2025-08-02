import { AxiosError } from "axios";
import API from "./httpClient";
import { InscripcionInput, Inscripcion } from "../types/inscripciones";
import { InscripcionJugador } from "../types/inscripcionesJugadores";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getInscripciones = async (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = ""
): Promise<{
  inscripciones: Inscripcion[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const response = await API.get("/api/inscripciones", {
      params: { page, limit, searchTerm },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return { inscripciones: [], total: 0, page: 1, limit: 10 };
};

export const getInscripcion = async (
  id: number
): Promise<Inscripcion | null> => {
  try {
    const response = await API.get(`/api/inscripciones/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return null;
};

export const procesarEquipo = async (
  inscripcion: Inscripcion,
  jugadores: InscripcionJugador[]
): Promise<{
  inscripcion: Inscripcion | null;
  jugadores: InscripcionJugador[] | null;
}> => {
  try {
    const response = await API.post("/api/inscripciones/procesarEquipo", {
      inscripcion: inscripcion,
      jugadores: jugadores,
    });
    return {
      inscripcion: response.data.inscripcion,
      jugadores: response.data.jugadores,
    };
  } catch (error) {
    handleAxiosError(error);
    return { inscripcion: null, jugadores: null };
  }
};

export const updateEquipoAsoc = async (id: number, idequipoasoc: number) => {
  try {
    const response = await API.put(`/api/inscripciones/${id}/equipo`, {
      idequipoasoc,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const saveInscripcion = async (
  data: InscripcionInput & { id?: number }
) => {
  try {
    const response = data.id
      ? await API.put(`/api/inscripciones/${data.id}`, data)
      : await API.post("/api/inscripciones", data);

    return response.data.inscripcion;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteInscripcion = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/inscripciones/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
