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
    console.log("🔍 Service - Obteniendo jugadores:", { idpartido, idequipo });
    const response = await API.get<PartidoJugadorExtendido[]>(
      `/api/partidos/${idpartido}/equipos/${idequipo}/jugadores`
    );
    console.log("✅ Service - Jugadores obtenidos:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Service - Error:", error);
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
    console.log("💾 Service - Guardando jugador:", {
      idpartido,
      idequipo,
      data,
    });
    await API.post(
      `/api/partidos/${idpartido}/equipos/${idequipo}/jugadores`,
      data
    );
    console.log("✅ Service - Jugador guardado exitosamente");
  } catch (error) {
    console.error("❌ Service - Error al guardar:", error);
    handleAxiosError(error);
  }
};

// ✅ SERVICIO DE ELIMINACIÓN CON DEBUG DETALLADO
// Reemplaza la función deletePartidoJugador en tu partidosJugadoresService.ts

export const deletePartidoJugador = async (
  idpartido: number,
  idequipo: number,
  idjugador: number
): Promise<void> => {
  const url = `/api/partidos/${idpartido}/equipos/${idequipo}/jugadores/${idjugador}`;

  console.log("🗑️ SERVICE - Iniciando eliminación:", {
    idpartido,
    idequipo,
    idjugador,
    url,
  });

  try {
    console.log("🔄 SERVICE - Enviando petición DELETE a:", url);

    const response = await API.delete(url);

    console.log("✅ SERVICE - Respuesta del servidor:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
    });

    if (response.status === 200) {
      console.log(
        "✅ SERVICE - Eliminación exitosa confirmada por el servidor"
      );
    } else {
      console.warn(
        "⚠️ SERVICE - Respuesta inesperada del servidor:",
        response.status
      );
    }
  } catch (error) {
    console.error("❌ SERVICE - Error completo:", error);

    if (error instanceof AxiosError) {
      console.error("❌ SERVICE - Axios Error Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          method: error.config?.method,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        },
      });

      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 404) {
        throw new Error(
          message || "El jugador no se encuentra en este partido."
        );
      } else if (status === 400) {
        throw new Error(message || "Parámetros inválidos.");
      } else if (status === 500) {
        throw new Error(message || "Error interno del servidor.");
      } else {
        throw new Error(message || `Error HTTP ${status}`);
      }
    }

    // Si no es un AxiosError, re-lanzar el error original
    throw error;
  }
};
