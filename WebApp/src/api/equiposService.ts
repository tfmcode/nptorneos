import { AxiosError } from "axios";
import API from "./httpClient";
import { Equipo, EquipoInput } from "../types/equipos";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getEquipos = async (
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<{
  equipos: Equipo[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const res = await API.get(
      `/api/equipos?page=${page}&limit=${limit}&searchTerm=${searchTerm}`
    );
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return { equipos: [], total: 0, page, limit };
};

export const saveEquipo = async (
  data: EquipoInput & { id?: number }
): Promise<Equipo | undefined> => {
  try {
    const res = data.id
      ? await API.put(`/api/equipos/${data.id}`, data)
      : await API.post("/api/equipos", data);
    return res.data.equipo;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteEquipo = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/equipos/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
