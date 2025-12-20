import { AxiosError } from "axios";
import API from "./httpClient";
import { Factura, FacturaInput } from "../types/factura";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getFacturas = async (
  page = 1,
  limit = 10,
  searchTerm = "",
  fechaDesde?: Date,
  fechaHasta?: Date
): Promise<{
  facturas: Factura[];
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

    const response = await API.get(`/api/facturas?${params.toString()}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return { facturas: [], total: 0, page, limit, totalPages: 0 };
};

export const getFacturaById = async (id: number): Promise<Factura | null> => {
  try {
    const response = await API.get(`/api/facturas/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return null;
};

export const saveFactura = async (
  data: FacturaInput & { id?: number }
): Promise<Factura> => {
  try {
    const response = data.id
      ? await API.put(`/api/facturas/${data.id}`, data)
      : await API.post("/api/facturas", data);

    return response.data.factura;
  } catch (error) {
    handleAxiosError(error);
  }
  throw new Error("No se pudo guardar la factura.");
};

export const deleteFactura = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/facturas/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
