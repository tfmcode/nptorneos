import { AxiosError } from "axios";
import API from "./httpClient";
import { Proveedor, ProveedorInput } from "../types/proveedores";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getProveedores = async (
  page = 1,
  limit = 10,
  searchTerm = ""
): Promise<{
  proveedores: Proveedor[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const response = await API.get(
      `/api/proveedores?page=${page}&limit=${limit}&searchTerm=${searchTerm}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return { proveedores: [], total: 0, page, limit };
};

export const saveProveedor = async (
  data: ProveedorInput & { id?: number }
): Promise<Proveedor> => {
  try {
    const response = data.id
      ? await API.put(`/api/proveedores/${data.id}`, data)
      : await API.post("/api/proveedores", data);

    return response.data.proveedor;
  } catch (error) {
    handleAxiosError(error);
  }
  throw new Error("No se pudo guardar el proveedor.");
};

export const deleteProveedor = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/proveedores/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
