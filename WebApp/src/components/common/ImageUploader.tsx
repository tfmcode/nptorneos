import React, { useRef, useState, useEffect } from "react";
import {
  PhotoIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useImageUpload } from "../../hooks/useImageUpload";

// ✅ Props del componente
interface ImageUploaderProps {
  // Identificación de entidad
  entityId: number | undefined;
  entityType?: "jugador" | "equipo";

  // Imagen actual
  currentImageUrl?: string | null;

  // Configuración
  maxImages?: number; // 1 para jugador, 3 para equipo
  disabled?: boolean;

  // Callbacks
  onUploadSuccess?: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  onDeleteSuccess?: () => void;

  // Estilo
  className?: string;
  height?: string;
}

/**
 * 🎨 COMPONENTE GENÉRICO DE UPLOAD DE IMÁGENES
 *
 * Características:
 * - Drag & drop
 * - Click para seleccionar
 * - Preview de imagen
 * - Barra de progreso
 * - Validaciones automáticas
 * - Responsive
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({
  entityId,
  entityType = "jugador",
  currentImageUrl,
  // maxImages, // Reservado para implementación de múltiples imágenes (equipos)
  disabled = false,
  onUploadSuccess,
  onUploadError,
  onDeleteSuccess,
  className = "",
  height = "200px", // ✅ Reducido para modales
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    status,
    progress,
    error,
    imageUrl,
    uploadImage,
    deleteImage,
    loadImageInfo,
    resetState,
  } = useImageUpload(entityId, entityType, onUploadSuccess, onUploadError);

  // Cargar imagen existente
  useEffect(() => {
    if (entityId) {
      loadImageInfo();
    }
  }, [entityId, loadImageInfo]);

  // Actualizar preview cuando cambia la imagen
  useEffect(() => {
    if (imageUrl) {
      // ✅ Construir URL completa del backend
      const fullUrl = imageUrl.startsWith("http")
        ? imageUrl
        : `http://localhost:5001${imageUrl}`;
      setPreviewUrl(fullUrl);
      console.log("🖼️ Preview URL actualizada:", fullUrl);
    } else if (currentImageUrl) {
      const fullUrl = currentImageUrl.startsWith("http")
        ? currentImageUrl
        : `http://localhost:5001/uploads/${currentImageUrl}`;
      setPreviewUrl(fullUrl);
      console.log("🖼️ Current image URL:", fullUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [imageUrl, currentImageUrl]);

  /**
   * Manejar selección de archivo
   */
  const handleFileSelect = async (file: File) => {
    if (disabled || !entityId) return;

    console.log("📁 Archivo seleccionado:", {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
    });

    // Crear preview local
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Subir archivo
    const success = await uploadImage(file);

    // Limpiar preview local
    URL.revokeObjectURL(localPreview);

    if (!success) {
      setPreviewUrl(currentImageUrl || null);
    }
  };

  /**
   * Manejar cambio en input de archivo
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * Manejar click en zona de upload
   */
  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  /**
   * Manejar drag over
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  /**
   * Manejar drag leave
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  /**
   * Manejar drop de archivo
   */
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || !entityId) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * Manejar eliminación de imagen
   */
  const handleDelete = async () => {
    if (disabled) return;

    const success = await deleteImage();
    if (success) {
      setPreviewUrl(null);
      resetState();
      onDeleteSuccess?.();
    }
  };

  /**
   * Obtener clase de estado
   */
  const getStatusClass = (): string => {
    if (disabled) return "opacity-50 cursor-not-allowed";
    if (isDragging) return "border-blue-500 bg-blue-50";
    if (status === "error") return "border-red-500";
    if (status === "success") return "border-green-500";
    return "border-gray-300 hover:border-blue-400";
  };

  /**
   * Renderizar contenido según estado
   */
  const renderContent = () => {
    // Mostrar imagen si existe
    if (previewUrl && status !== "uploading") {
      return (
        <div className="relative w-full h-full group">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              console.error("❌ Error cargando imagen:", previewUrl);
              // Si falla, mostrar placeholder
              e.currentTarget.style.display = "none";
            }}
          />

          {/* Overlay con opciones */}
          {!disabled && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  Cambiar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Mostrar progreso si está subiendo
    if (status === "uploading") {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 p-6">
          <ArrowUpTrayIcon className="h-12 w-12 text-blue-600 animate-bounce" />
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Subiendo imagen...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      );
    }

    // Mostrar zona de drop
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <PhotoIcon className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-sm font-medium text-gray-700 mb-1">
          {isDragging
            ? "Suelta la imagen aquí"
            : "Arrastra una imagen o haz click para seleccionar"}
        </p>
        <p className="text-xs text-gray-500">
          JPG, JPEG, PNG o WEBP (máx. 5MB)
        </p>
        {!disabled && (
          <button
            type="button"
            onClick={handleClick}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Seleccionar imagen
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Zona de upload */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
          ${getStatusClass()}
        `}
        style={{ height }}
      >
        {renderContent()}

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {/* Mensaje de estado */}
      {status === "success" && !error && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
          <span>Imagen subida correctamente</span>
        </div>
      )}

      {status === "error" && error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Información adicional */}
      {!disabled && !previewUrl && (
        <p className="text-xs text-gray-500 text-center">
          La imagen se comprimirá automáticamente a máximo 2MB manteniendo la
          calidad
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
