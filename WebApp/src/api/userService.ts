import { AxiosError } from "axios";
import API from "./httpClient";
import { User, UserInput } from "../types/user";

/**
 * Maneja errores de Axios y arroja mensajes claros
 */
const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data) {
    throw error.response.data; // Mensaje del servidor
  }
  throw new Error("Ocurrió un error inesperado");
};

/**
 * Crea un nuevo usuario
 * @param data - Datos del nuevo usuario
 * @returns Usuario creado o undefined si ocurre un error
 */
export const createUser = async (
  data: UserInput
): Promise<User | undefined> => {
  try {
    const response = await API.post("/api/users", data);
    return response.data.user;
  } catch (error) {
    handleAxiosError(error);
    return undefined; // Ahora TypeScript sabe que puede devolver undefined
  }
};

/**
 * Obtiene todos los usuarios
 * @returns Lista de usuarios o undefined si ocurre un error
 */
export const getUsers = async (): Promise<User[] | undefined> => {
  try {
    const response = await API.get("/api/users");
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    return undefined; // Solución para cumplir con el tipo de retorno
  }
};

/**
 * Elimina un usuario por ID
 * @param id - ID del usuario a eliminar
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
 * @param id - ID del usuario a actualizar
 * @param data - Nuevos datos del usuario
 * @returns Usuario actualizado o undefined si ocurre un error
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
    return undefined; // Cumple con el tipo de retorno esperado
  }
};
