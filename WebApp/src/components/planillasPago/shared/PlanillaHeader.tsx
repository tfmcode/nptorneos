// WebApp/src/components/planillasPago/shared/PlanillaHeader.tsx

import React from "react";
import { PlanillaPago } from "../../../types/planillasPago";

interface PlanillaHeaderProps {
  planilla: PlanillaPago;
  estado: string;
  estadoColor: "green" | "yellow" | "gray";
}

const Badge: React.FC<{
  text: string;
  color: "green" | "yellow" | "gray";
}> = ({ text, color }) => {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-800 border-green-300",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
    gray: "bg-gray-100 text-gray-800 border-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colorMap[color]}`}
    >
      {text}
    </span>
  );
};

export const PlanillaHeader: React.FC<PlanillaHeaderProps> = ({
  planilla,
  estado,
  estadoColor,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-lg font-semibold text-gray-900">
            Planilla de Pago
          </h2>
          <Badge text={estado} color={estadoColor} />
        </div>
        <div className="text-sm text-gray-500 space-y-1">
          <div>
            <strong>Fecha:</strong>{" "}
            {planilla.fecha &&
              new Date(planilla.fecha).toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
          </div>
          <div>
            <strong>Sede:</strong> {planilla.sede_nombre || "-"} ·{" "}
            <strong>Torneo:</strong>{" "}
            {planilla.torneo_nombre || planilla.torneo || "-"}
            {planilla.zona && ` · ${planilla.zona}`}
          </div>
        </div>
      </div>
    </div>
  );
};
