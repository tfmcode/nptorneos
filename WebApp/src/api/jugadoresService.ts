import { AxiosError } from "axios";
import API from "./httpClient";
import { Jugador, JugadorInput } from "../types/jugadores";

// ✅ Interfaz para errores tipados
interface ApiErrorResponse {
  message: string;
  type?: string;
}

// ✅ Clase de error personalizada para documento duplicado
export class DuplicateDocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateDocumentError";
  }
}

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data) {
    const errorData = error.response.data as ApiErrorResponse;

    console.error("❌ API Error:", errorData.message);

    // ✅ Manejar específicamente el error de documento duplicado
    if (errorData.type === "DUPLICATE_DOCUMENT") {
      throw new DuplicateDocumentError(errorData.message);
    }

    // Otros errores de la API
    throw new Error(errorData.message);
  }

  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getJugadores = async (
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<{
  jugadores: Jugador[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const response = await API.get(
      `/api/jugadores?page=${page}&limit=${limit}&searchTerm=${searchTerm}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return { jugadores: [], total: 0, page, limit };
};

export const getJugadorById = async (
  id: number
): Promise<Jugador | undefined> => {
  try {
    const response = await API.get(`/api/jugadores/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined;
};

export const createJugador = async (
  data: JugadorInput
): Promise<Jugador | undefined> => {
  try {
    const response = await API.post("/api/jugadores", data);
    return response.data.jugador;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined;
};

export const updateJugador = async (
  id: number,
  data: JugadorInput
): Promise<Jugador | undefined> => {
  try {
    const response = await API.put(`/api/jugadores/${id}`, data);
    return response.data.jugador;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined;
};

export const deleteJugador = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/jugadores/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
