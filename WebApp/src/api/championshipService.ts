import { AxiosError } from "axios";
import API from "./httpClient";
import { Championship, ChampionshipInput } from "../types/championship";

/**
 * Maneja errores de Axios y arroja mensajes claros
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
 * Obtiene todos los campeonatos
 */
export const getChampionships = async (): Promise<Championship[]> => {
  try {
    const response = await API.get("/api/championships");
    return response.data ?? [];
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

/**
 * Crea o actualiza un campeonato
 */
export const createOrUpdateChampionship = async (
  data: ChampionshipInput & { _id?: string }
): Promise<Championship | undefined> => {
  try {
    const response = data._id
      ? await API.put(`/api/championships/${data._id}`, data)
      : await API.post("/api/championships", data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined;
};

/**
 * Elimina un campeonato por ID
 */
export const deleteChampionship = async (id: string): Promise<void> => {
  try {
    await API.delete(`/api/championships/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
