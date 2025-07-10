import { AxiosError } from "axios";
import API from "./httpClient";
import { SancionInput, Sancion } from "../types/sanciones";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getSanciones = async (
  page = 1,
  limit = 10,
  searchTerm = "",
  startDate = "",
  endDate = ""
): Promise<{
  sanciones: Sancion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (searchTerm) queryParams.append("searchTerm", searchTerm);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);

    const response = await API.get(`/api/sanciones?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return { sanciones: [], total: 0, page, limit, totalPages: 0 };
};

export const getSancion = async (id: number): Promise<Sancion | null> => {
  try {
    const response = await API.get(`/api/sanciones/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return null;
};

export const saveSancion = async (data: SancionInput & { id?: number }) => {
  try {
    const response = data.id
      ? await API.put(`/api/sanciones/${data.id}`, data)
      : await API.post("/api/sanciones", data);

    return response.data.sancion;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteSancion = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/sanciones/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
