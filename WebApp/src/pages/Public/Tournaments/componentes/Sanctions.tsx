import React from "react";
import { Sancion } from "../../../../types";

interface SanctionsProps {
  sanciones: Sancion[];
}

// Función para limpiar HTML y extraer solo el texto
const stripHTML = (html: string): string => {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, "") // Remover tags HTML
    .replace(/&nbsp;/g, " ") // Reemplazar &nbsp; con espacios
    .replace(/&amp;/g, "&") // Reemplazar &amp; con &
    .replace(/&lt;/g, "<") // Reemplazar &lt; con <
    .replace(/&gt;/g, ">") // Reemplazar &gt; con >
    .replace(/&quot;/g, '"') // Reemplazar &quot; con "
    .replace(/&#039;/g, "'") // Reemplazar &#039; con '
    .replace(/\s+/g, " ") // Normalizar espacios
    .trim();
};

const Sanctions: React.FC<SanctionsProps> = ({ sanciones }) => {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-center mb-4">SANCIONES</h2>

      {sanciones.length === 0 ? (
        <div className="text-center text-gray-500 py-8 border border-gray-300 rounded-lg bg-white">
          No hay sanciones registradas para este torneo.
        </div>
      ) : (
        <div className="h-[400px] border border-gray-300 rounded-lg shadow-md bg-white">
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {sanciones.map((sancion) => (
              <div
                key={sancion.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
              >
                <div className="mb-2">
                  <strong>JUGADOR:</strong>{" "}
                  {sancion.jugador || "No especificado"}
                </div>
                <div className="mb-2">
                  <strong>EQUIPO:</strong> {sancion.equipo || "No especificado"}
                </div>
                <div className="mb-2">
                  <strong>FECHA:</strong> {sancion.fecha || "No especificada"}
                </div>
                {sancion.titulo && (
                  <div className="mb-2">
                    <strong className="text-red-600">
                      {sancion.titulo.toUpperCase()}
                    </strong>
                  </div>
                )}
                {sancion.descripcion && (
                  <div className="text-gray-700 bg-white p-3 rounded border-l-4 border-yellow-500 mt-2">
                    <div className="whitespace-pre-wrap break-words text-sm">
                      {stripHTML(sancion.descripcion)}
                    </div>
                  </div>
                )}
                {sancion.fechafin && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                    <strong className="text-red-600">
                      Sanción vigente hasta:
                    </strong>{" "}
                    <span className="font-medium">{sancion.fechafin}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sanctions;
