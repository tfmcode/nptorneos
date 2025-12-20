import { AxiosError } from "axios";
import API from "./httpClient";
import {
  CuentaCorrienteEquipo,
  ResumenCuentaCorriente,
} from "../types/cuentasCorrientes";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

/**
 * Obtener cuenta corriente de un equipo específico
 */
export const getCuentaCorrienteEquipo = async (
  idequipo: number
): Promise<CuentaCorrienteEquipo> => {
  try {
    const response = await API.get(
      `/api/cuentas-corrientes/equipo/${idequipo}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  // TypeScript safety - nunca llegará aquí
  throw new Error("Error inesperado");
};

/**
 * Obtener resumen de cuentas corrientes de todos los equipos
 */
export const getCuentasCorrientesGeneral = async (): Promise<
  ResumenCuentaCorriente[]
> => {
  try {
    const response = await API.get(`/api/cuentas-corrientes/general`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  // TypeScript safety - nunca llegará aquí
  throw new Error("Error inesperado");
};
