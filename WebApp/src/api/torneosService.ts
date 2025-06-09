import { AxiosError } from "axios";
import API from "./httpClient";
import { Torneo, TorneoInput } from "../types/torneos";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getTorneos = async (
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<{
  torneos: Torneo[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const response = await API.get(
      `/api/torneos?page=${page}&limit=${limit}&searchTerm=${searchTerm}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return { torneos: [], total: 0, page, limit };
};

export const saveTorneo = async (data: TorneoInput & { id?: number }) => {
  try {
    const response = data.id
      ? await API.put(`/api/torneos/${data.id}`, data)
      : await API.post("/api/torneos", data);

    return response.data.torneo;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteTorneo = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/torneos/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
