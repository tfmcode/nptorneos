import { AxiosError } from "axios";
import API from "./httpClient";
import { InscripcionJugadorInput } from "../types/inscripcionesJugadores";
import { InscripcionInput } from "../types/inscripciones";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.error) {
    console.error("❌ API Error:", error.response.data.error);
    throw new Error(error.response.data.error);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export interface InscripcionPublicInput extends InscripcionInput {
  jugadores: InscripcionJugadorInput[];
}

export const sendInscripcionPublic = async (
  data: InscripcionPublicInput
): Promise<void> => {
  try {
    await API.post("/api/public/inscripciones", data);
  } catch (error) {
    handleAxiosError(error);
  }
};
