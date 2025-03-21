import API from "./httpClient"; // Asegúrate de que el import esté correcto
import { AxiosError } from "axios";

interface APIErrorResponse {
  message?: string;
}

export const loginUsuario = async (credentials: {
  email: string;
  contrasenia: string;
}) => {
  try {
    const response = await API.post("/api/usuarios/login", credentials);
    const { token, user } = response.data;

    // ✅ Guardar el token en `localStorage` para mantener la sesión
    if (token) {
      localStorage.setItem("token", token);
    }

    return { token, user };
  } catch (error) {
    const axiosError = error as AxiosError<APIErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        "Error de red o servidor no disponible"
    );
  }
};
