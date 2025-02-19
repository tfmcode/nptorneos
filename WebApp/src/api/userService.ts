import { AxiosError } from "axios";
import API from "./httpClient";
import { User, UserInput } from "../types/user";

/**
 * Maneja errores de Axios y arroja mensajes claros
 */
const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado");
};

/**
 * Crea o actualiza un usuario
 */
export const saveUser = async (data: UserInput & { _id?: string }) => {
  try {
    const response = data._id
      ? await API.put(`/api/users/${data._id}`, data)
      : await API.post("/api/users", data);

    return response.data.user;
  } catch (error) {
    handleAxiosError(error);
  }
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
  return [];
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
