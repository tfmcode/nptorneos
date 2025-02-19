import { AxiosError } from "axios";
import API from "./httpClient";
import { Venue, VenueInput } from "../types/venue";

/**
 * Maneja errores de Axios y arroja mensajes claros
 */
const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado");
};

/**
 * Crea o actualiza una sede
 */
export const saveVenue = async (data: VenueInput & { _id?: string }) => {
  try {
    const response = data._id
      ? await API.put(`/api/venues/${data._id}`, data)
      : await API.post("/api/venues", data);

    return response.data.venue;
  } catch (error) {
    handleAxiosError(error);
  }
};

/**
 * Obtiene todas las sedes con paginación
 */
export const getVenues = async (
  page: number,
  limit: number
): Promise<Venue[]> => {
  try {
    const response = await API.get(`/api/venues?page=${page}&limit=${limit}`);
    return response.data.venues ?? []; // ✅ Accedemos a venues dentro de la respuesta
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

/**
 * Elimina una sede por ID
 */
export const deleteVenue = async (id: string): Promise<void> => {
  try {
    await API.delete(`/api/venues/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
