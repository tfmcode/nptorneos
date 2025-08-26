import { AxiosError } from "axios";
import API from "./httpClient"; // Reutilizamos la configuración de Axios
import { CajaMovimiento } from "../types/cajamovimiento";
import { dateToInputValue } from "../helpers/dateHelpers";

/**
 * Manejo de errores de Axios para obtener mensajes claros
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
 * Obtiene todas las cajamovimientos
 */
export const getCajaMovimientos = async (
  page = 1,
  limit = 10,
  searchTerm = "",
  fechaDesde = new Date("1900-01-01"),
  fechaHasta = new Date("2099-12-31"),
): Promise<{
  cajamovimientos: CajaMovimiento[];
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
    if (fechaDesde) queryParams.append("fechaDesde", dateToInputValue(fechaDesde));
    if (fechaHasta) queryParams.append("fechaHasta", dateToInputValue(fechaHasta));
    
    console.log("queryparams:", queryParams.toString());
    console.log("fecha desde: ", dateToInputValue(fechaDesde), " fecha hasta: ", dateToInputValue(fechaHasta));
  
    console.log("todo la url:", `/api/cajamovimientos?${queryParams.toString()}`);

    const response = await API.get(`/api/cajamovimientos?${queryParams.toString()}`);
    
    console.log("response: ", response);

    return response.data ?? [];
  } catch (error) {
    handleAxiosError(error);
  }
  return { cajamovimientos: [], total: 0, page, limit, totalPages: 0 };
};

/**
 * Crea o actualiza un cajamovimiento
 */
export const saveCajaMovimiento = async (data: CajaMovimiento & { id?: number }) => {
  try {
    if (!data.nrocomprobante) {
      throw new Error("El campo N° comprobante es obligatorio.");
    }
    

    const cajamovimientoPayload = {
      ...data
    };

    console.log("📦 Payload enviado:", cajamovimientoPayload);

    const response = data.id
      ? await API.put(`/api/cajamovimientos/${data.id}`, cajamovimientoPayload)
      : await API.post("/api/cajamovimientos", cajamovimientoPayload);

    return response.data.cajamovimiento;
  } catch (error) {
    handleAxiosError(error);
  }
};

/**
 * Elimina una cajamovimiento por ID (Soft Delete)
 */
export const deleteCajaMovimiento = async (id: number): Promise<void> => {
  try {
    if (!id) throw new Error("El ID del movimiento de caja es obligatorio para eliminar.");
    await API.delete(`/api/cajamovimientos/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};

/**
 * Obtiene las facturas pendientes del proveedor para afectar a un movimiento de caja
 */
export const getFacturasPendientes = async (
  proveedor: string,
  dc: number = 1
): Promise<any[]> => {
  try {
    if (!proveedor) {
      throw new Error("El proveedor es obligatorio para obtener facturas pendientes.");
    }

    console.log(`/api/cajamovimientos/facturaspendientes/${encodeURIComponent(proveedor)}?dc=${dc}`);

    const response = await API.get(
      `/api/cajamovimientos/facturaspendientes/${encodeURIComponent(proveedor)}?dc=${dc}`
    );

    return response.data ?? [];
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};
