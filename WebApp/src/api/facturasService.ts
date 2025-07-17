import { AxiosError } from "axios";
import API from "./httpClient"; // Reutilizamos la configuración de Axios
import { Factura, FacturaInput } from "../types/factura";
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
 * Obtiene todas las facturas
 */
export const getFacturas = async (
  page = 1,
  limit = 10,
  searchTerm = "",
  fechaDesde = new Date("1900-01-01"),
  fechaHasta = new Date("2099-12-31"),
): Promise<{
  facturas: Factura[];
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

    console.log("Filtros enviados:", {
      page,
      limit,
      searchTerm,
      fechaDesde,
      fechaHasta,
    });

    console.log("query Params: ", queryParams.toString() )
    const response = await API.get("/api/facturas?${queryParams.toString()}`");
    console.log("facturas: ", response.data );
    return response.data ?? [];
  } catch (error) {
    handleAxiosError(error);
  }
  return { facturas: [], total: 0, page, limit, totalPages: 0 };
};

/**
 * Crea o actualiza una factura
 */
export const saveFactura = async (data: FacturaInput & { id?: number }) => {
  try {
    if (!data.nroComprobante) {
      throw new Error("El campo N° comprobante es obligatorio.");
    }


    const facturaPayload = {
      ...data
    };

    const response = data.id
      ? await API.put(`/api/facturas/${data.id}`, facturaPayload)
      : await API.post("/api/facturas", facturaPayload);

    return response.data.factura;
  } catch (error) {
    handleAxiosError(error);
  }
};

/**
 * Elimina una factura por ID (Soft Delete)
 */
export const deleteFactura = async (id: number): Promise<void> => {
  try {
    if (!id) throw new Error("El ID de la factura es obligatorio para eliminar.");
    await API.delete(`/api/facturas/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
