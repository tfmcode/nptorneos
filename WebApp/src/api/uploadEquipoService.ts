import API from "./httpClient";
import { AxiosProgressEvent, AxiosError } from "axios";
import { UploadResponse, ImageInfo } from "./uploadService";

export const uploadEquipoImagen = async (
  equipoId: number,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("imagen", file);

    const response = await API.post<UploadResponse>(
      `/api/upload/equipo/${equipoId}`,
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
    console.error("❌ Error al subir imagen:", error);

    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as {
        message?: string;
        code?: string;
      };
      return {
        success: false,
        message: errorData.message || "Error al subir la imagen",
        error: errorData.code,
      };
    }

    return {
      success: false,
      message: "Error de conexión al subir la imagen",
      error: "NETWORK_ERROR",
    };
  }
};

export const deleteEquipoImagen = async (
  equipoId: number
): Promise<UploadResponse> => {
  try {
    const response = await API.delete<UploadResponse>(
      `/api/upload/equipo/${equipoId}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error al eliminar imagen:", error);

    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as { message?: string };
      return {
        success: false,
        message: errorData.message || "Error al eliminar la imagen",
      };
    }

    return {
      success: false,
      message: "Error de conexión al eliminar la imagen",
    };
  }
};

export const getEquipoImagenInfo = async (
  equipoId: number
): Promise<ImageInfo> => {
  try {
    const response = await API.get<ImageInfo>(
      `/api/upload/equipo/${equipoId}/info`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener info de imagen:", error);

    return {
      success: false,
      hasImage: false,
      message: "Error al obtener información de la imagen",
    };
  }
};
