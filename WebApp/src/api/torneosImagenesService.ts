import { AxiosError } from "axios";
import API from "./httpClient";
import { TorneosImagen } from "../types/torneosImagenes";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

// Get all images by torneo
export const getTorneoImagenesByTorneo = async (
  idTorneo: number
): Promise<TorneosImagen[]> => {
  try {
    const response = await API.get(`/api/torneos-imagenes/torneo/${idTorneo}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

// Get single image by id
export const getTorneoImagen = async (
  id: number
): Promise<TorneosImagen | null> => {
  try {
    const response = await API.get(`/api/torneos-imagenes/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return null;
};

// Upload image file
export const uploadImage = async (dataUrl: string): Promise<string> => {
  try {
    const response = await API.post("/api/torneos-imagenes/upload", {
      image: dataUrl,
    });
    return response.data.fileName;
  } catch (error) {
    return handleAxiosError(error);
  }
};

// Create or update image
export const saveTorneoImagen = async (
  data: Partial<TorneosImagen> & { id?: number }
): Promise<TorneosImagen> => {
  const response = data.id
    ? await API.put(`/api/torneos-imagenes/${data.id}`, data)
    : await API.post("/api/torneos-imagenes", data);

  return response.data.imagen;
};

// Delete image
export const deleteTorneoImagen = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/torneos-imagenes/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
