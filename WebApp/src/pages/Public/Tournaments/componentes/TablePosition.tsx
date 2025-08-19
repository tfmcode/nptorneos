import React, { useEffect, useMemo, useState } from "react";
import { Posicion } from "../../../../types";

interface TablePositionProps {
  positions: Record<string, Posicion[]>;
  initialZone?: string; // <<--- NUEVO: zona por defecto
}

const TablePosition: React.FC<TablePositionProps> = ({
  positions,
  initialZone,
}) => {
  const zonas = useMemo(() => Object.keys(positions).sort(), [positions]);

  // Calcula la zona activa por defecto: usa initialZone si existe en 'zonas', si no la primera
  const computedDefault = useMemo<string>(() => {
    if (initialZone && zonas.includes(initialZone)) return initialZone;
    return zonas[0] || "";
  }, [initialZone, zonas]);

  const [activeZone, setActiveZone] = useState<string>(computedDefault);

  // Si cambia initialZone o cambian las zonas, sincroniza la activa
  useEffect(() => {
    setActiveZone(computedDefault);
  }, [computedDefault]);

  const cols = [
    "Pos",
    "Equipo",
    "PTS",
    "PJ",
    "PG",
    "PE",
    "PP",
    "GF",
    "GC",
    "DIF",
    "PB",
  ];

  const rows = useMemo(() => {
    const list = positions[activeZone] || [];
    return list.map((pos, i) => [
      i + 1,
      pos.equipo_nombre,
      pos.puntos,
      pos.jugados,
      pos.ganados,
      pos.empatados,
      pos.perdidos,
      pos.gf,
      pos.gc,
      pos.dg,
      pos.pb,
    ]);
  }, [positions, activeZone]);

  // Estado vacío total (sin zonas)
  if (zonas.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-gray-500">Sin zonas para mostrar.</div>
      </div>
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

      {/* Tabla completa sin scroll */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead className="bg-gray-100 text-gray-700 border-b border-gray-300">
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
              rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
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
                  Sin posiciones para esta zona.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablePosition;
