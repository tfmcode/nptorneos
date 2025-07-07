import { AxiosError } from "axios";
import API from "./httpClient";
import { EquipoJugador, EquipoJugadorInput } from "../types/equiposJugadores";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getEquipoJugadoresByEquipo = async (
  idequipo: number
): Promise<EquipoJugador[]> => {
  try {
    const response = await API.get(`/api/equipos-jugadores/equipo/${idequipo}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

export const getEquipoJugador = async (
  id: number
): Promise<EquipoJugador | null> => {
  try {
    const response = await API.get(`/api/equipos-jugadores/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return null;
};

export const saveEquipoJugador = async (
  data: EquipoJugadorInput & { id?: number }
): Promise<EquipoJugador> => {
  const response = data.id
    ? await API.put(`/api/equipos-jugadores/${data.id}`, data)
    : await API.post("/api/equipos-jugadores", data);

  return response.data.jugador;
};

export const deleteEquipoJugador = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/equipos-jugadores/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
