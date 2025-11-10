import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Point, Area } from "react-easy-crop/";
import {
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number; // 1 para cuadrado, 16/9 para horizontal, etc.
}

/**
 * 🎨 COMPONENTE DE RECORTE DE IMAGEN
 *
 * Permite al usuario recortar y rotar la imagen antes de subirla
 */
const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 1, // Cuadrado por defecto
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (location: Point) => {
    setCrop(location);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onRotationChange = (rotation: number) => {
    setRotation(rotation);
  };

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  /**
   * Crear imagen recortada
   */
  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Calcular dimensiones con rotación
      const maxSize = Math.max(image.width, image.height);
      const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

      canvas.width = safeArea;
      canvas.height = safeArea;

      // Traducir canvas al centro
      ctx.translate(safeArea / 2, safeArea / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-safeArea / 2, -safeArea / 2);

      // Dibujar imagen rotada
      ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
      );

      // Extraer área recortada
      const data = ctx.getImageData(
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // Crear canvas final con el tamaño recortado
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.putImageData(data, 0, 0);

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            onCropComplete(blob);
          }
        },
        "image/jpeg",
        0.95
      );
    } catch (error) {
      console.error("Error al recortar imagen:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ajustar Imagen</h3>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
            Cancelar
          </button>
          <button
            onClick={createCroppedImage}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <CheckIcon className="h-5 w-5" />
            Aplicar
          </button>
        </div>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspectRatio}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onRotationChange={onRotationChange}
          onCropComplete={onCropCompleteCallback}
        />
      </div>

      {/* Controls */}
      <div className="bg-gray-900 text-white p-6 space-y-4">
        {/* Zoom */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
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
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Rotation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <ArrowPathIcon className="h-4 w-4" />
              Rotación
            </label>
            <span>{rotation}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-400 text-center space-y-1">
          <p>• Arrastra para mover la imagen</p>
          <p>• Pellizca o usa la rueda del mouse para hacer zoom</p>
          <p>• Ajusta la rotación si es necesario</p>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
};

/**
 * Helper para crear elemento Image desde URL
 */
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

export default ImageCropper;
