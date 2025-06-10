import { AxiosError } from "axios";
import API from "./httpClient";
import { Partido } from "../types/partidos";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getPartidosByZona = async (idZona: number): Promise<Partido[]> => {
  try {
    const response = await API.get(`/api/partidos/zona/${idZona}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

export const getPartido = async (id: number): Promise<Partido | null> => {
  try {
    const response = await API.get(`/api/partidos/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return null;
};

export const savePartido = async (
  data: Partial<Partido> & { id?: number }
): Promise<Partido> => {
  const response = data.id
    ? await API.put(`/api/partidos/${data.id}`, data)
    : await API.post("/api/partidos", data);

  return response.data.partido;
};

export const deletePartido = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/partidos/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
