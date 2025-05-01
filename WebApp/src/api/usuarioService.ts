import { AxiosError } from "axios";
import API from "./httpClient";
import { Usuario, UsuarioInput } from "../types/usuario";

const handleAxiosError = (error: unknown): string => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    return error.response.data.message;
  }
  console.error("❌ Unexpected Error:", error);
  return "Ocurrió un error inesperado.";
};

export const saveUsuario = async (
  data: UsuarioInput & { idusuario?: number }
) => {
  try {
    if (!data.nombre || !data.apellido || !data.email) {
      throw new Error("Los campos nombre, apellido y email son obligatorios.");
    }

    const usuarioPayload = {
      ...data,
      perfil: Number(data.perfil) || 1,
      habilitado: data.habilitado ? 1 : 0,
    };

    if (data.contrasenia?.trim() === "") {
      delete usuarioPayload.contrasenia;
    }

    const response = data.idusuario
      ? await API.put(`/api/usuarios/${data.idusuario}`, usuarioPayload)
      : await API.post("/api/usuarios", usuarioPayload);

    return response.data.user;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    const response = await API.get("/api/usuarios");
    return response.data ?? [];
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

export const deleteUsuario = async (idusuario: number): Promise<void> => {
  try {
    if (!idusuario)
      throw new Error("El ID de usuario es obligatorio para eliminar.");

    await API.delete(`/api/usuarios/${idusuario}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
