// WebApp/src/api/uploadEquipoService.ts

import API from "./httpClient";
import { AxiosProgressEvent, AxiosError } from "axios";
import { UploadResponse, ImageInfo } from "./uploadService";

/**
 * 📤 SUBIR ESCUDO DE EQUIPO
 */
export const uploadEquipoImagen = async (
  equipoId: number,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("imagen", file);

    // ✅ Ruta actualizada con /escudo
    const response = await API.post<UploadResponse>(
      `/api/upload/equipo/${equipoId}/escudo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error al subir escudo:", error);

    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as {
        message?: string;
        code?: string;
      };
      return {
        success: false,
        message: errorData.message || "Error al subir el escudo",
        error: errorData.code,
      };
    }

    return {
      success: false,
      message: "Error de conexión al subir el escudo",
      error: "NETWORK_ERROR",
    };
  }
};

/**
 * 🗑️ ELIMINAR ESCUDO DE EQUIPO
 */
export const deleteEquipoImagen = async (
  equipoId: number
): Promise<UploadResponse> => {
  try {
    // ✅ Ruta actualizada con /escudo
    const response = await API.delete<UploadResponse>(
      `/api/upload/equipo/${equipoId}/escudo`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error al eliminar escudo:", error);

    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as { message?: string };
      return {
        success: false,
        message: errorData.message || "Error al eliminar el escudo",
      };
    }

    return {
      success: false,
      message: "Error de conexión al eliminar el escudo",
    };
  }
};

/**
 * 📊 OBTENER INFORMACIÓN DEL ESCUDO
 */
export const getEquipoImagenInfo = async (
  equipoId: number
): Promise<ImageInfo> => {
  try {
    // ✅ Ruta actualizada con /escudo/info
    const response = await API.get<ImageInfo>(
      `/api/upload/equipo/${equipoId}/escudo/info`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener info del escudo:", error);

    return {
      success: false,
      hasImage: false,
      message: "Error al obtener información del escudo",
    };
  }
};
