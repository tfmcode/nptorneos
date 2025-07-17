import { AxiosError } from "axios";
import API from "./httpClient";
import {
  TorneosEquiposInsc,
  TorneosEquiposInscInput,
} from "../types/torneosEquiposInsc";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getTorneosEquiposInsc = async (
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<{
  inscripciones: TorneosEquiposInsc[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const res = await API.get(
      `/api/torneos-equipos-insc?page=${page}&limit=${limit}&searchTerm=${searchTerm}`
    );
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return { inscripciones: [], total: 0, page, limit };
};

export const getTorneosEquiposInscById = async (
  id: number
): Promise<TorneosEquiposInsc | null> => {
  try {
    const response = await API.get(`/api/torneos-equipos-insc/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return null;
};

export const getTorneosEquiposInscByTorneo = async (
  idtorneo: number
): Promise<TorneosEquiposInsc[]> => {
  try {
    const response = await API.get(
      `/api/torneos-equipos-insc/torneo/${idtorneo}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

export const getTorneosEquiposInscByEquipo = async (
  idequipo: number
): Promise<TorneosEquiposInsc[]> => {
  try {
    const response = await API.get(
      `/api/torneos-equipos-insc/equipo/${idequipo}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

export const saveTorneosEquiposInsc = async (
  data: TorneosEquiposInscInput & { id?: number }
): Promise<TorneosEquiposInsc | undefined> => {
  try {
    const res = data.id
      ? await API.put(`/api/torneos-equipos-insc/${data.id}`, data)
      : await API.post("/api/torneos-equipos-insc", data);
    return res.data.inscripcion;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteTorneosEquiposInsc = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/torneos-equipos-insc/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
