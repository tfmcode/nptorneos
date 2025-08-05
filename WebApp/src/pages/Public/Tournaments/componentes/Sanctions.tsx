import React from "react";
import { Sancion } from "../../../../types";

interface SanctionsProps {
  sanciones: Sancion[];
}

const Sanctions: React.FC<SanctionsProps> = ({ sanciones }) => {
  const visibleSanciones = sanciones.slice(0, 6);

  return (
    <div className="h-[288px] border border-gray-300 rounded-lg shadow-md text-sm bg-white">
      <div className="p-4 border-b font-semibold bg-gray-50 text-gray-700">
        SANCIONES
      </div>

      <div className="h-[240px] overflow-y-auto px-4 py-2 space-y-4">
        {visibleSanciones.length === 0 ? (
          <p className="text-gray-500 italic">No hay sanciones registradas.</p>
        ) : (
          visibleSanciones.map((s, idx) => (
            <div
              key={s.id ?? idx}
              className="border-b border-gray-200 pb-2 last:border-none"
            >
              <p className="mb-1">
                <strong>JUGADOR:</strong> {s.jugador}
              </p>
              <p className="mb-1">
                <strong>EQUIPO:</strong> {s.equipo}
              </p>
              <p className="mb-1">
                <strong>FECHA:</strong> {s.fecha}
              </p>
              {s.titulo && (
                <p className="mb-1">
                  <strong>{s.titulo.toUpperCase()}</strong>
                </p>
              )}
              {s.descripcion && (
                <p className="text-gray-700 whitespace-pre-line break-words">
                  {s.descripcion}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sanctions;
