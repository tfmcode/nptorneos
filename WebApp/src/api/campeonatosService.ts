import { AxiosError } from "axios";
import API from "./httpClient"; // Configuración de Axios
import { Campeonato, CampeonatoInput } from "../types/campeonato";

/**
 * Manejo de errores de Axios para obtener mensajes claros
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
 * Obtiene todos los campeonatos
 */
export const getCampeonatos = async (): Promise<Campeonato[]> => {
  try {
    const response = await API.get("/api/campeonatos");
    return response.data ?? [];
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

/**
 * Crea o actualiza un campeonato
 */
export const saveCampeonato = async (
  data: CampeonatoInput & { id?: number }
) => {
  try {
    const response = data.id
      ? await API.put(`/api/campeonatos/${data.id}`, data)
      : await API.post("/api/campeonatos", data);

    return response.data.campeonato;
  } catch (error) {
    handleAxiosError(error);
  }
};

/**
 * Elimina un campeonato por ID (Soft Delete)
 */
export const deleteCampeonato = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/campeonatos/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
