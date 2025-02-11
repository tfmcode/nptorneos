import API from "./httpClient";
import { AxiosError } from "axios";

interface APIErrorResponse {
  message?: string; // 👈 Hacemos que `message` sea opcional
}

export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const response = await API.post("/api/users/login", credentials);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<APIErrorResponse>; // ✅ Tipamos `AxiosError` con `APIErrorResponse`
    throw (
      axiosError.response?.data?.message ||
      "Error de red o servidor no disponible"
    );
  }
};
