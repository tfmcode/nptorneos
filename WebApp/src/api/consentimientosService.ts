import { AxiosError } from "axios";
import API from "./httpClient";
import { Consentimiento } from "../types/consentimientos";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getConsentimientos = async (
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<{
  consentimientos: Consentimiento[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const response = await API.get(
      `/api/consentimientos?page=${page}&limit=${limit}&searchTerm=${searchTerm}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return { consentimientos: [], total: 0, page, limit };
};

export const getConsentimientoById = async (
  id: number
): Promise<Consentimiento | undefined> => {
  try {
    const response = await API.get(`/api/consentimientos/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined;
};

export const createConsentimiento = async (
  data: Consentimiento
): Promise<Consentimiento | undefined> => {
  try {
    const response = await API.post("/api/consentimientos", data);
    return response.data.consentimiento;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined;
};

export const updateConsentimiento = async (
  id: number,
  data: Consentimiento
): Promise<Consentimiento | undefined> => {
  try {
    const response = await API.put(`/api/consentimientos/${id}`, data);
    return response.data.consentimiento;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined;
};

export const deleteConsentimiento = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/consentimientos/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
