import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  PhotoIcon,
  CameraIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Cropper from "react-easy-crop";
import { Point, Area } from "react-easy-crop/";
import { useImageUpload } from "../../hooks/useImageUpload";
import { getImageUrl } from "../../utils/imageUtils";

interface ImageUploaderProps {
  entityId: number | undefined;
  entityType?: "jugador" | "equipo";
  currentImageUrl?: string | null;
  disabled?: boolean;
  onUploadSuccess?: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  onDeleteSuccess?: () => void;
  className?: string;
  size?: "small" | "medium" | "large";
  aspectRatio?: number;
}

const ImageUploaderInline: React.FC<ImageUploaderProps> = ({
  entityId,
  entityType = "jugador",
  currentImageUrl,
  disabled = false,
  onUploadSuccess,
  onUploadError,
  onDeleteSuccess,
  className = "",
  size = "medium",
  aspectRatio = 1,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [hasBeenDeleted, setHasBeenDeleted] = useState(false);

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

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

  const sizeClasses = {
    small: "w-24 h-24",
    medium: "w-32 h-32",
    large: "w-40 h-40",
  };

  const containerSize = sizeClasses[size];

  useEffect(() => {
    if (entityId) {
      loadImageInfo();
    }
  }, [entityId, loadImageInfo]);

  useEffect(() => {
    if (imageUrl) {
      const tipo = entityType === "equipo" ? "equipo-escudo" : "jugador";
      const fullUrl = getImageUrl(imageUrl, tipo);
      setPreviewUrl(fullUrl);
      setHasBeenDeleted(false); // Resetear flag al subir nueva imagen
    } else if (currentImageUrl && !hasBeenDeleted) {
      // ← CLAVE: no usar si se eliminó
      const tipo = entityType === "equipo" ? "equipo-escudo" : "jugador";
      const fullUrl = getImageUrl(currentImageUrl, tipo);
      setPreviewUrl(fullUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [imageUrl, currentImageUrl, entityType, hasBeenDeleted]);

  const handleFileSelect = async (file: File) => {
    if (disabled || !entityId) return;

    const tempUrl = URL.createObjectURL(file);
    setImageToCrop(tempUrl);
    setPendingFile(file);
    setShowCropper(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async () => {
    if (!croppedAreaPixels || !imageToCrop) return;

    try {
      const image = await createImage(imageToCrop);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob(
        async (blob) => {
          if (blob) {
            const croppedFile = new File(
              [blob],
              pendingFile?.name || "cropped-image.jpg",
              { type: "image/jpeg" }
            );

            setShowCropper(false);
            if (imageToCrop) {
              URL.revokeObjectURL(imageToCrop);
            }
            setImageToCrop(null);
            setPendingFile(null);

            const localPreview = URL.createObjectURL(croppedFile);
            setPreviewUrl(localPreview);

            const success = await uploadImage(croppedFile);

            URL.revokeObjectURL(localPreview);

            if (!success) {
              const tipo =
                entityType === "equipo" ? "equipo-escudo" : "jugador";
              setPreviewUrl(getImageUrl(currentImageUrl, tipo));
            }
          }
        },
        "image/jpeg",
        0.95
      );
    } catch (error) {
      console.error("Error al recortar imagen:", error);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
    setImageToCrop(null);
    setPendingFile(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    if (disabled) return;
    cameraInputRef.current?.click();
  };

  const handleDelete = async () => {
    if (disabled) return;
    const success = await deleteImage();
    if (success) {
      setPreviewUrl(null);
      setHasBeenDeleted(true);
      resetState();
      onDeleteSuccess?.();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        className={`
          ${containerSize}
          relative
          border-2 border-dashed rounded-xl
          transition-all duration-200
          ${
            disabled
              ? "opacity-50 cursor-not-allowed border-gray-300"
              : "border-gray-400"
          }
          ${status === "error" ? "border-red-500" : ""}
          ${status === "success" && !error ? "border-green-500" : ""}
          overflow-hidden
          bg-gradient-to-br from-gray-50 to-gray-100
        `}
      >
        {showCropper && imageToCrop ? (
          <div className="absolute inset-0 bg-white">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  width: "100%",
                  height: "100%",
                  position: "relative",
                },
              }}
            />
          </div>
        ) : status === "uploading" ? (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <div className="w-3/4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Subiendo...</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("❌ Error cargando imagen:", previewUrl);
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-2">
            <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-xs font-medium text-gray-600">
              {entityType === "equipo" ? "Logo" : "Foto"}
            </p>
          </div>
        )}
      </div>

      {showCropper && imageToCrop && (
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <label>🔍 Zoom</label>
              <span>{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCropCancel}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-all font-medium"
            >
              <XMarkIcon className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="button"
              onClick={createCroppedImage}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-all font-medium"
            >
              <CheckIcon className="h-4 w-4" />
              Aplicar
            </button>
          </div>
        </div>
      )}

      {!showCropper && !disabled && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCameraClick}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all hover:shadow-md font-medium"
            >
              <CameraIcon className="h-4 w-4" />
              Cámara
            </button>
            <button
              type="button"
              onClick={handleFileClick}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all hover:shadow-md font-medium"
            >
              <PhotoIcon className="h-4 w-4" />
              {previewUrl ? "Cambiar" : "Archivo"}
            </button>
          </div>

          {previewUrl && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-all hover:shadow-md font-medium"
            >
              <TrashIcon className="h-4 w-4" />
              Eliminar
            </button>
          )}
        </>
      )}

      {status === "error" && error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          ❌ {error}
        </div>
      )}

      {status === "success" && !error && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
          ✓ Imagen actualizada
        </div>
      )}

      {!previewUrl && !disabled && !showCropper && (
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Máx. 5MB
          <br />
          Se recortará y comprimirá
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

export default ImageUploaderInline;
