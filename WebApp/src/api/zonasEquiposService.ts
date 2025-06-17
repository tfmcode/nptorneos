import { AxiosError } from "axios";
import API from "./httpClient";
import { ZonaEquipo, ZonaEquipoInput } from "../types/zonasEquipos";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getZonasEquiposByTorneo = async (
  idTorneo: number
): Promise<ZonaEquipo[]> => {
  try {
    const response = await API.get(`/api/zonas-equipos/torneo/${idTorneo}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

export const getZonaEquipo = async (id: number): Promise<ZonaEquipo | null> => {
  try {
    const response = await API.get(`/api/zonas-equipos/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return null;
};

export const saveZonaEquipo = async (
  data: ZonaEquipoInput & { id?: number }
): Promise<ZonaEquipo> => {
  const response = data.id
    ? await API.put(`/api/zonas-equipos/${data.id}`, data)
    : await API.post("/api/zonas-equipos", data);

  return response.data.zonaEquipo;
};

export const deleteZonaEquipo = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/zonas-equipos/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
