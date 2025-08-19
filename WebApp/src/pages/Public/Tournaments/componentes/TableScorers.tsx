import React, { useEffect, useMemo, useState } from "react";
import { Goleador } from "../../../../types";

interface TableScorersProps {
  scorersByZona: Record<string, Goleador[]>;
  initialZone?: string; // zona por defecto (sincronizada con el padre)
}

const TableScorers: React.FC<TableScorersProps> = ({
  scorersByZona,
  initialZone,
}) => {
  const zonas = useMemo(
    () => Object.keys(scorersByZona).sort(),
    [scorersByZona]
  );

  // Zona activa por defecto
  const computedDefault = useMemo<string>(() => {
    if (initialZone && zonas.includes(initialZone)) return initialZone;
    return zonas[0] || "";
  }, [initialZone, zonas]);

  const [activeZone, setActiveZone] = useState<string>(computedDefault);

  // Re-sincroniza si cambia initialZone o cambian las zonas
  useEffect(() => {
    setActiveZone(computedDefault);
  }, [computedDefault]);

  const cols = ["Pos", "Jugador", "Equipo", "Goles"];

  const rows = useMemo(() => {
    const list = scorersByZona[activeZone] ?? [];
    return list.map((scorer, i) => [
      i + 1,
      scorer.jugador,
      scorer.equipo,
      scorer.goles,
    ]);
  }, [scorersByZona, activeZone]);

  if (zonas.length === 0) {
    return (
      <div className="text-center text-gray-500">Sin zonas para mostrar.</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Tabs de zonas */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {zonas.map((zona) => (
          <button
            key={zona}
            onClick={() => setActiveZone(zona)}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              activeZone === zona
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {zona.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tabla con header sticky y scroll vertical tras ~6 filas */}
      <div className="overflow-x-auto">
        <div className="max-h-[288px] overflow-y-auto rounded-md border border-gray-200">
          <table className="w-full text-sm text-center">
            <thead className="bg-gray-100 text-gray-700 border-b border-gray-300 sticky top-0 z-10 shadow-sm">
              <tr>
                {cols.map((c) => (
                  <th key={c} className="px-3 py-2 whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-3 py-2 border-b border-gray-200 whitespace-nowrap"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-gray-500"
                    colSpan={cols.length}
                  >
                    Sin goleadores para esta zona.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableScorers;
