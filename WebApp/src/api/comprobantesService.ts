import { AxiosError } from "axios";
import API from "./httpClient"; // tu instancia de Axios configurada
import { Comprobante } from "../types/comprobante"; // interfaz si la tenés, si no la armamos abajo

/**
 * Manejo de errores
 */
const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

/**
 * Obtiene comprobantes según módulo (1 = Facturación, 2 = Caja, etc.)
 */
export const getComprobantesPorModulo = async (
  modulo: number
): Promise<Comprobante[]> => {
  try {
    const response = await API.get(`/api/comprobantes/modulo/${modulo}`);
    return response.data ?? [];
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};
