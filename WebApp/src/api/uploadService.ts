import API from "./httpClient";
import { AxiosProgressEvent, AxiosError } from "axios";

// ✅ Interfaces para respuestas de API
export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    filename: string;
    size: number;
    url: string;
  };
  error?: string;
}

export interface ImageInfo {
  success: boolean;
  hasImage: boolean;
  message?: string;
  data?: {
    filename: string;
    url: string;
    size: number;
    width: number;
    height: number;
    format: string;
  };
}

// ✅ Configuración de límites
export const IMAGE_UPLOAD_CONFIG = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB antes de compresión
  maxSizeMB: 5,
  allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
};

/**
 * 📤 Subir imagen de jugador
 */
export const uploadJugadorImagen = async (
  jugadorId: number,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  try {
    // Crear FormData
    const formData = new FormData();
    formData.append("imagen", file);

    // Hacer request con tracking de progreso
    const response = await API.post<UploadResponse>(
      `/api/upload/jugador/${jugadorId}`,
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

    // Manejar errores de Axios específicamente
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

/**
 * 🗑️ Eliminar imagen de jugador
 */
export const deleteJugadorImagen = async (
  jugadorId: number
): Promise<UploadResponse> => {
  try {
    const response = await API.delete<UploadResponse>(
      `/api/upload/jugador/${jugadorId}`
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

/**
 * 📊 Obtener información de imagen de jugador
 */
export const getJugadorImagenInfo = async (
  jugadorId: number
): Promise<ImageInfo> => {
  try {
    const response = await API.get<ImageInfo>(
      `/api/upload/jugador/${jugadorId}/info`
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

/**
 * ✅ Validar archivo antes de subir
 */
export const validateImageFile = (
  file: File
): { valid: boolean; error?: string } => {
  // Validar tipo de archivo
  if (!IMAGE_UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Solo se permiten: JPG, JPEG, PNG, WEBP`,
    };
  }

  // Validar extensión
  const extension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf("."));
  if (!IMAGE_UPLOAD_CONFIG.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Extensión no permitida: ${extension}`,
    };
  }

  // Validar tamaño
  if (file.size > IMAGE_UPLOAD_CONFIG.maxSizeBytes) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `La imagen es demasiado grande (${sizeMB}MB). Máximo permitido: ${IMAGE_UPLOAD_CONFIG.maxSizeMB}MB`,
    };
  }

  return { valid: true };
};

/**
 * 🖼️ Obtener URL de imagen
 */
export const getImageUrl = (
  filename: string | null | undefined
): string | null => {
  if (!filename) return null;

  // Si ya es una URL completa, retornarla
  if (filename.startsWith("http")) return filename;

  // Construir URL relativa
  return `/uploads/${filename}`;
};
