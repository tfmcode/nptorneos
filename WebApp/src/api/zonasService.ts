import { AxiosError } from "axios";
import API from "./httpClient";
import { Zona, ZonaInput } from "../types/zonas";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getZonasByTorneo = async (idTorneo: number): Promise<Zona[]> => {
  try {
    const response = await API.get(`/api/zonas/torneo/${idTorneo}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

export const getZona = async (id: number): Promise<Zona | null> => {
  try {
    const response = await API.get(`/api/zonas/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return null;
};

export const saveZona = async (
  data: ZonaInput & { id?: number }
): Promise<Zona> => {
  const response = data.id
    ? await API.put(`/api/zonas/${data.id}`, data)
    : await API.post("/api/zonas", data);

  return response.data.zona;
};

export const deleteZona = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/zonas/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
