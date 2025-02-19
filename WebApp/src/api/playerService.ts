import { AxiosError } from "axios";
import API from "./httpClient";
import { Player, PlayerInput } from "../types/player";

/**
 * Manejo de errores de Axios con mensajes más claros
 */
const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data) {
    console.error("API Error:", error.response.data);
    throw error.response.data;
  }
  console.error("Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado");
};

/**
 * Obtener todos los jugadores con paginación y búsqueda
 */
export const getPlayers = async (
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<{
  players: Player[];
  totalPlayers: number;
  page: number;
  limit: number;
}> => {
  try {
    const response = await API.get(
      `/api/players?page=${page}&limit=${limit}&name=${searchTerm}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    throw error;
  }
};

/**
 * Obtener un jugador por ID
 */
export const getPlayerById = async (
  id: string
): Promise<Player | undefined> => {
  try {
    const response = await API.get(`/api/players/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined;
};

/**
 * Crear un nuevo jugador
 */
export const createPlayer = async (
  data: PlayerInput
): Promise<Player | undefined> => {
  try {
    const response = await API.post("/api/players", data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined;
};

/**
 * Actualizar un jugador
 */
export const updatePlayer = async (
  id: string,
  data: PlayerInput
): Promise<Player | undefined> => {
  try {
    const response = await API.put(`/api/players/${id}`, data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined;
};

/**
 * Eliminar un jugador
 */
export const deletePlayer = async (id: string): Promise<void> => {
  try {
    await API.delete(`/api/players/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
