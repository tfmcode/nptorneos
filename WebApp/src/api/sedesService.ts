import { AxiosError } from "axios";
import API from "./httpClient"; // Reutilizamos la configuración de Axios
import { Sede, SedeInput } from "../types/sede";

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
 * Obtiene todas las sedes
 */
export const getSedes = async (): Promise<Sede[]> => {
  try {
    const response = await API.get("/api/sedes");
    return response.data ?? [];
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

/**
 * Crea o actualiza una sede
 */
export const saveSede = async (data: SedeInput & { id?: number }) => {
  try {
    if (!data.nombre || !data.domicilio) {
      throw new Error("Los campos nombre y domicilio son obligatorios.");
    }

    const sedePayload = {
      ...data,
      mapa: Number(data.mapa) || 0, // ✅ Convertimos `mapa` a número si es válido
    };

    const response = data.id
      ? await API.put(`/api/sedes/${data.id}`, sedePayload)
      : await API.post("/api/sedes", sedePayload);

    return response.data.sede;
  } catch (error) {
    handleAxiosError(error);
  }
};

/**
 * Elimina una sede por ID (Soft Delete)
 */
export const deleteSede = async (id: number): Promise<void> => {
  try {
    if (!id) throw new Error("El ID de la sede es obligatorio para eliminar.");
    await API.delete(`/api/sedes/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
