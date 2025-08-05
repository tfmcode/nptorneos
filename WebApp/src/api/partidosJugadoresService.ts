import { AxiosError } from "axios";
import API from "./httpClient";
import {
  PartidoJugadorExtendido,
  PartidoJugadorInput,
} from "../types/partidosJugadores";

// Manejo de errores estándar
const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

// ✅ Obtener jugadores por equipo y partido
export const getJugadoresPorEquipo = async (
  idpartido: number,
  idequipo: number
): Promise<PartidoJugadorExtendido[]> => {
  try {
    const response = await API.get<PartidoJugadorExtendido[]>(
      `/api/partidos/${idpartido}/equipos/${idequipo}/jugadores`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  throw new Error("Error inesperado al obtener jugadores del equipo.");
};

// ✅ Guardar/actualizar participación de un jugador en un partido
export const savePartidoJugador = async (
  idpartido: number,
  idequipo: number,
  data: PartidoJugadorInput
): Promise<void> => {
  try {
    await API.post(
      `/api/partidos/${idpartido}/equipos/${idequipo}/jugadores`,
      data
    );
  } catch (error) {
    handleAxiosError(error);
  }
};
