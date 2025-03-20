import { AxiosError } from "axios";
import API from "./httpClient";
import { Jugador, JugadorInput } from "../types/jugadores";

/**
 * 📌 Manejo de errores de Axios con mensajes más claros
 */
const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

/**
 * 🔍 Obtener jugadores con paginación y búsqueda
 */
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

/**
 * 🔍 Obtener un jugador por ID
 */
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

/**
 * 🆕 Crear un nuevo jugador
 */
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

/**
 * 🔄 Actualizar un jugador
 */
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

/**
 * ❌ Eliminar un jugador (Soft Delete)
 */
export const deleteJugador = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/jugadores/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
