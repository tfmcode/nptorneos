import React, { useEffect } from "react";

interface Props {
  open: boolean;
  type: "success" | "error" | "warning";
  message: string;
  onClose: () => void;
}

export const PopupNotificacion: React.FC<Props> = ({
  open,
  type,
  message,
  onClose,
}) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  const baseStyle =
    "rounded-md p-4 shadow-md border flex items-start gap-3 max-w-sm w-full animate-fade-in-up";
  const typeStyles = {
    success: "bg-green-50 border-green-400 text-green-700",
    error: "bg-red-50 border-red-400 text-red-700",
    warning: "bg-yellow-50 border-yellow-400 text-yellow-700",
  };

  const icon = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
  }[type];

  return (
    <>
      <div className="fixed inset-0 flex justify-center items-start z-50 pointer-events-none p-4 sm:p-6">
        <div className={`${baseStyle} ${typeStyles[type]} pointer-events-auto`}>
          <div className="text-xl">{icon}</div>
          <div className="flex-1">
            <p className="font-medium">
              {type === "success" && "Éxito"}
              {type === "error" && "Error"}
              {type === "warning" && "Atención"}
            </p>
            <p dangerouslySetInnerHTML={{ __html: message }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>
    </>
  );
};
