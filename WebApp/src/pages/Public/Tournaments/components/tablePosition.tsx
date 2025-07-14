import React, { useState } from "react";
import { Posicion } from "../../../../types/posiciones";

interface TablePositionProps {
  positions: Record<string, Posicion[]>;
}

const TablePosition: React.FC<TablePositionProps> = ({ positions }) => {
  const zonas = Object.keys(positions).sort();
  const [activeZone, setActiveZone] = useState<string>(zonas[0] || "");

  const filteredPositions = positions[activeZone] || [];

  return (
    <div className="overflow-x-auto">
      {/* Tabs de Zonas */}
      <div className="flex justify-center space-x-2 mb-4">
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

      {/* Tabla de Posiciones */}
      <table className="w-full text-center mb-6">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-2 py-1">Pos</th>
            <th className="px-2 py-1">Equipo</th>
            <th className="px-2 py-1">PTS</th>
            <th className="px-2 py-1">PJ</th>
            <th className="px-2 py-1">PG</th>
            <th className="px-2 py-1">PE</th>
            <th className="px-2 py-1">PP</th>
            <th className="px-2 py-1">GF</th>
            <th className="px-2 py-1">GC</th>
            <th className="px-2 py-1">DIF</th>
          </tr>
        </thead>
        <tbody>
          {filteredPositions.map((position, index) => (
            <tr
              key={position.equipo_id}
              className="hover:bg-gray-50 even:bg-gray-50"
            >
              <td className="px-2 py-1">{index + 1}</td>
              <td className="px-2 py-1 font-semibold text-blue-700">
                {position.equipo_nombre}
              </td>
              <td className="px-2 py-1 font-bold text-blue-600">
                {position.puntos}
              </td>
              <td className="px-2 py-1">{position.jugados}</td>
              <td className="px-2 py-1">{position.ganados}</td>
              <td className="px-2 py-1">{position.empatados}</td>
              <td className="px-2 py-1">{position.perdidos}</td>
              <td className="px-2 py-1">{position.gf}</td>
              <td className="px-2 py-1">{position.gc}</td>
              <td className="px-2 py-1">{position.dg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablePosition;
