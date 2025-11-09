import { useState, useCallback } from "react";
import {
  uploadJugadorImagen,
  deleteJugadorImagen,
  getJugadorImagenInfo,
  validateImageFile,
  ImageInfo,
} from "../api/uploadService";

// ✅ Estados posibles del upload
export type UploadStatus = "idle" | "uploading" | "success" | "error";

// ✅ Interface para el estado del hook
interface UseImageUploadState {
  // Estado
  status: UploadStatus;
  progress: number;
  error: string | null;
  imageUrl: string | null;
  imageInfo: ImageInfo | null;

  // Acciones
  uploadImage: (file: File) => Promise<boolean>;
  deleteImage: () => Promise<boolean>;
  loadImageInfo: () => Promise<void>;
  resetState: () => void;
  setPreviewUrl: (url: string | null) => void;
}

/**
 * 🎯 HOOK PERSONALIZADO PARA UPLOAD DE IMÁGENES
 *
 * @param entityId - ID de la entidad (jugador, equipo, etc.)
 * @param entityType - Tipo de entidad ("jugador", "equipo", etc.)
 * @param onSuccess - Callback opcional cuando el upload es exitoso
 * @param onError - Callback opcional cuando hay un error
 */
export const useImageUpload = (
  entityId: number | undefined,
  entityType: "jugador" | "equipo" = "jugador",
  onSuccess?: (imageUrl: string) => void,
  onError?: (error: string) => void
): UseImageUploadState => {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);

  /**
   * Resetear estado
   */
  const resetState = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setError(null);
  }, []);

  /**
   * Establecer URL de preview
   */
  const setPreviewUrl = useCallback((url: string | null) => {
    setImageUrl(url);
  }, []);

  /**
   * Cargar información de imagen existente
   */
  const loadImageInfo = useCallback(async () => {
    if (!entityId) return;

    try {
      let info;
      if (entityType === "jugador") {
        info = await getJugadorImagenInfo(entityId);
      } else if (entityType === "equipo") {
        const { getEquipoImagenInfo } = await import(
          "../api/uploadEquipoService"
        );
        info = await getEquipoImagenInfo(entityId);
      } else {
        return;
      }

      setImageInfo(info);

      if (info.hasImage && info.data?.url) {
        setImageUrl(info.data.url);
      }
    } catch (err) {
      console.error("Error al cargar info de imagen:", err);
    }
  }, [entityId, entityType]);

  /**
   * 📤 Subir imagen
   */
  const uploadImage = useCallback(
    async (file: File): Promise<boolean> => {
      if (!entityId) {
        setError("ID de entidad no válido");
        setStatus("error");
        onError?.("ID de entidad no válido");
        return false;
      }

      // Resetear estado previo
      resetState();
      setStatus("uploading");

      // Validar archivo
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || "Archivo no válido");
        setStatus("error");
        onError?.(validation.error || "Archivo no válido");
        return false;
      }

      try {
        // Subir imagen según tipo de entidad
        let response;
        if (entityType === "jugador") {
          response = await uploadJugadorImagen(
            entityId,
            file,
            (progressValue) => {
              setProgress(progressValue);
            }
          );
        } else if (entityType === "equipo") {
          const { uploadEquipoImagen } = await import(
            "../api/uploadEquipoService"
          );
          response = await uploadEquipoImagen(
            entityId,
            file,
            (progressValue) => {
              setProgress(progressValue);
            }
          );
        } else {
          throw new Error(`Tipo de entidad no soportado: ${entityType}`);
        }

        if (response.success && response.data) {
          setStatus("success");
          setImageUrl(response.data.url);
          setProgress(100);
          onSuccess?.(response.data.url);

          // Recargar información de la imagen
          await loadImageInfo();

          return true;
        } else {
          throw new Error(response.message || "Error al subir imagen");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al subir la imagen";
        setError(errorMessage);
        setStatus("error");
        setProgress(0);
        onError?.(errorMessage);
        return false;
      }
    },
    [entityId, entityType, resetState, onSuccess, onError, loadImageInfo]
  );

  /**
   * 🗑️ Eliminar imagen
   */
  const deleteImage = useCallback(async (): Promise<boolean> => {
    if (!entityId) {
      setError("ID de entidad no válido");
      onError?.("ID de entidad no válido");
      return false;
    }

    try {
      setStatus("uploading");

      // Eliminar imagen según tipo de entidad
      let response;
      if (entityType === "jugador") {
        response = await deleteJugadorImagen(entityId);
      } else if (entityType === "equipo") {
        const { deleteEquipoImagen } = await import(
          "../api/uploadEquipoService"
        );
        response = await deleteEquipoImagen(entityId);
      } else {
        throw new Error(`Tipo de entidad no soportado: ${entityType}`);
      }

      if (response.success) {
        setImageUrl(null);
        setImageInfo(null);
        setStatus("success");
        return true;
      } else {
        throw new Error(response.message || "Error al eliminar imagen");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar la imagen";
      setError(errorMessage);
      setStatus("error");
      onError?.(errorMessage);
      return false;
    }
  }, [entityId, entityType, onError]);

  return {
    // Estado
    status,
    progress,
    error,
    imageUrl,
    imageInfo,

    // Acciones
    uploadImage,
    deleteImage,
    loadImageInfo,
    resetState,
    setPreviewUrl,
  };
};
