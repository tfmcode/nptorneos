import { AxiosError } from "axios";
import API from "./httpClient";
import {
  PartidoJugadorExtendido,
  PartidoJugadorInput,
} from "../types/partidosJugadores";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

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

export const deletePartidoJugador = async (
  idpartido: number,
  idequipo: number,
  idjugador: number
): Promise<void> => {
  try {
    await API.delete(
      `/api/partidos/${idpartido}/equipos/${idequipo}/jugadores/${idjugador}`
    );
  } catch (error) {
    handleAxiosError(error);
  }
};
