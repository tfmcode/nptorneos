import { AxiosError } from "axios";
import API from "./httpClient";

export interface TorneoDelEquipo {
  torneo_id: number;
  torneo_nombre: string;
  torneo_abrev: string;
  torneo_anio: number;
  torneo_estado: number;
  zona_id: number;
  zona_nombre: string;
  zona_abrev: string;
  primer_partido: string | null;
  total_partidos: number;
}

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getTorneosByEquipo = async (
  idEquipo: number
): Promise<TorneoDelEquipo[]> => {
  try {
    const response = await API.get(`/api/equipo-torneos/equipo/${idEquipo}`);
    return response.data;
  } catch (error) {
    // Si es 404, no es error real, solo no tiene torneos
    if (error instanceof AxiosError && error.response?.status === 404) {
      return [];
    }
    handleAxiosError(error);
  }
  return [];
};
