import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large"; // ✅ AGREGAR ESTA LÍNEA
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium", // ✅ AGREGAR ESTA LÍNEA (default: medium)
}) => {
  if (!isOpen) return null;

  // ✅ AGREGAR ESTAS CLASES DE TAMAÑO
  const sizeClasses = {
    small: "max-w-2xl",
    medium: "max-w-4xl",
    large: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 py-8">
      <div
        className={`bg-white rounded-lg shadow-lg w-full ${sizeClasses[size]} relative flex flex-col max-h-[85vh]`}
      >
        {/* Header del Modal */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          {title && (
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 pr-8">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Contenido del Modal con scroll */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
