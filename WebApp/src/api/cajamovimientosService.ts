import { AxiosError } from "axios";
import API from "./httpClient";
import { CajaMovimiento, CajaMovimientoInput } from "../types/cajamovimiento";
import { Factura } from "../types/factura";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getCajaMovimientos = async (
  page = 1,
  limit = 10,
  searchTerm = "",
  fechaDesde?: Date,
  fechaHasta?: Date
): Promise<{
  cajamovimientos: CajaMovimiento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      searchTerm: searchTerm,
    });

    if (fechaDesde) {
      params.append("fechaDesde", fechaDesde.toISOString().split("T")[0]);
    }
    if (fechaHasta) {
      params.append("fechaHasta", fechaHasta.toISOString().split("T")[0]);
    }

    const response = await API.get(`/api/cajamovimientos?${params.toString()}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return { cajamovimientos: [], total: 0, page, limit, totalPages: 0 };
};

export const getCajaMovimientoById = async (
  id: number
): Promise<CajaMovimiento | null> => {
  try {
    const response = await API.get(`/api/cajamovimientos/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return null;
};

export const saveCajaMovimiento = async (
  data: CajaMovimientoInput & { id?: number }
): Promise<CajaMovimiento> => {
  try {
    const response = data.id
      ? await API.put(`/api/cajamovimientos/${data.id}`, data)
      : await API.post("/api/cajamovimientos", data);

    return response.data.cajamovimiento;
  } catch (error) {
    handleAxiosError(error);
  }
  throw new Error("No se pudo guardar el movimiento de caja.");
};

export const deleteCajaMovimiento = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/cajamovimientos/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getFacturasPendientes = async (
  proveedorId: number,
  dc: number = 1
): Promise<Factura[]> => {
  try {
    const response = await API.get(
      `/api/cajamovimientos/facturas-pendientes/${proveedorId}?dc=${dc}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};
