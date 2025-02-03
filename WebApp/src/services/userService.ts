import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001",
});

// Interfaz para usuarios
export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
}

// Función para crear un usuario
export const createUser = async (data: UserInput): Promise<User> => {
  const response = await API.post("/api/users", data);
  return response.data.user; // Devuelve solo el usuario
};

// Función para obtener todos los usuarios
export const getUsers = async (): Promise<User[]> => {
  const response = await API.get("/api/users");
  return response.data; // Devuelve solo la lista de usuarios
};

// Función para eliminar un usuario
export const deleteUser = async (id: string): Promise<void> => {
  await API.delete(`/api/users/${id}`);
};

// Función para actualizar un usuario
export const updateUser = async (
  id: string,
  data: { name: string; email: string; password: string }
) => {
  try {
    const response = await API.put(`/api/users/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw error.response.data; // Datos del servidor
    } else {
      throw "Ocurrió un error inesperado"; // Error genérico
    }
  }
};
