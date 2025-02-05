import { AxiosError } from "axios";
import API from "./httpClient";
import { User, UserInput } from "../types/user";

/**
 * Maneja errores de Axios y arroja mensajes claros
 */
const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data) {
    console.error("API Error:", error.response.data);
    throw error.response.data;
  }
  console.error("Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado");
};

/**
 * Crea un nuevo usuario
 */
export const createUser = async (
  data: UserInput
): Promise<User | undefined> => {
  try {
    const response = await API.post("/api/users", data);
    return response.data.user;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined; // ✅ Agregado para evitar el error de TypeScript
};

/**
 * Obtiene todos los usuarios
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await API.get("/api/users");
    return response.data ?? [];
  } catch (error) {
    handleAxiosError(error);
  }
  return []; // ✅ Si hay error, retorna un array vacío
};

/**
 * Elimina un usuario por ID
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await API.delete(`/api/users/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};

/**
 * Actualiza un usuario
 */
export const updateUser = async (
  id: string,
  data: UserInput
): Promise<User | undefined> => {
  try {
    const response = await API.put(`/api/users/${id}`, data);
    return response.data.user;
  } catch (error) {
    handleAxiosError(error);
  }
  return undefined; // ✅ Agregado para corregir el error
};
