import { AxiosError } from "axios";
import API from "./httpClient";
import { ListaNegra, ListaNegraInput } from "../types/listaNegra";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getListaNegra = async (
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<{
  registros: ListaNegra[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const response = await API.get(
      `/api/lista-negra?page=${page}&limit=${limit}&searchTerm=${searchTerm}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return { registros: [], total: 0, page, limit };
};

export const getRegistroListaNegraById = async (
  id: number
): Promise<ListaNegra | undefined> => {
  try {
    const response = await API.get(`/api/lista-negra/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined;
};

export const createRegistroListaNegra = async (
  data: ListaNegraInput
): Promise<ListaNegra | undefined> => {
  try {
    const response = await API.post("/api/lista-negra", data);
    return response.data.registro;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined;
};

export const updateRegistroListaNegra = async (
  id: number,
  data: ListaNegraInput
): Promise<ListaNegra | undefined> => {
  try {
    const response = await API.put(`/api/lista-negra/${id}`, data);
    return response.data.registro;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined;
};

export const deleteRegistroListaNegra = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/lista-negra/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
