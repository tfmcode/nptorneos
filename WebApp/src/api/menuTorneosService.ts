import { AxiosError } from "axios";
import API from "./httpClient";
import { MenuTorneo, MenuTorneoInput } from "../types/menuTorneos";

// Manejo de errores centralizado
const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

/**
 * Obtener menús de torneos por categoría
 * @param idopcion número de categoría (1=AEJBA, 2=Fem, 5=F5, etc.)
 */
export const getMenuTorneosByOpcion = async (
  idopcion: number
): Promise<MenuTorneo[]> => {
  try {
    const response = await API.get(`/api/menutorneos/${idopcion}`);
    return response.data; // Asegúrate que el backend devuelva el array directamente
  } catch (error) {
    handleAxiosError(error);
  }
  return []; // fallback seguro
};

/**
 * Guardar o actualizar un menú de torneo
 */
export const saveMenuTorneo = async (
  data: MenuTorneoInput & { ordenAnterior?: number }
): Promise<MenuTorneo> => {
  try {
    if (data.ordenAnterior !== undefined) {
      // Update
      const response = await API.put(
        `/api/menutorneos/${data.idopcion}/${data.ordenAnterior}`,
        data
      );
      return response.data.menu;
    } else {
      // Create
      const response = await API.post(`/api/menutorneos`, data);
      return response.data.menu;
    }
  } catch (error) {
    handleAxiosError(error);
  }
  throw new Error("No se pudo guardar el menú de torneo.");
};

/**
 * Eliminar un menú de torneo
 */
export const deleteMenuTorneo = async (
  idopcion: number,
  orden: number
): Promise<void> => {
  try {
    await API.delete(`/api/menutorneos/${idopcion}/${orden}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
