import { AxiosError } from "axios";
import API from "./httpClient";
import { InscripcionJugador } from "../types/inscripcionesJugadores";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getInscripcionesJugadores = async (): Promise<
  InscripcionJugador[]
> => {
  try {
    const response = await API.get("/api/inscripciones-jugadores");
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

export const getInscripcionesJugadoresByInscripcion = async (
  idinscrip: number
): Promise<InscripcionJugador[]> => {
  try {
    const response = await API.get(
      `/api/inscripciones-jugadores/inscripcion/${idinscrip}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

export const getInscripcionJugador = async (
  id: number
): Promise<InscripcionJugador | null> => {
  try {
    const response = await API.get(`/api/inscripciones-jugadores/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return null;
};

export const saveInscripcionJugador = async (data: InscripcionJugador) => {
  try {
    const response = data.id
      ? await API.put(`/api/inscripciones-jugadores/${data.id}`, data)
      : await API.post("/api/inscripciones-jugadores", data);

    return response.data.inscripcionJugador;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteInscripcionJugador = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/inscripciones-jugadores/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
