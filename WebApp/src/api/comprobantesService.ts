import { AxiosError } from "axios";
import API from "./httpClient";

interface Comprobante {
  codigo: string;
  descripcion?: string;
  dc?: number;
  modulo?: number;
}

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getComprobantesPorModulo = async (
  modulo: number
): Promise<Comprobante[]> => {
  try {
    const response = await API.get(`/api/comprobantes/modulo/${modulo}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

export const getAllComprobantes = async (): Promise<Comprobante[]> => {
  try {
    const response = await API.get("/api/comprobantes");
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};
