import React, { useState } from "react";
import { Goleador } from "../../../../types/";

interface TableScorersProps {
  scorersByZona: Record<string, Goleador[]>;
}

const TableScorers: React.FC<TableScorersProps> = ({ scorersByZona }) => {
  const zonas = Object.keys(scorersByZona);
  const [activeTab, setActiveTab] = useState(zonas[0]);

  const scorers = scorersByZona[activeTab] || [];

  return (
    <div className="overflow-x-auto">
      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        {zonas.map((zona) => (
          <button
            key={zona}
            onClick={() => setActiveTab(zona)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === zona ? "bg-yellow-600 text-white" : "bg-gray-200"
            }`}
          >
            {zona.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <table className="w-full border border-gray-300 text-center mb-8">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 border">Pos</th>
            <th className="px-4 py-2 border">Jugador</th>
            <th className="px-4 py-2 border">Equipo</th>
            <th className="px-4 py-2 border">Goles</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((scorer, index) => (
            <tr key={scorer.idjugador} className="hover:bg-gray-100">
              <td className="px-4 py-2 border">{index + 1}</td>
              <td className="px-4 py-2 border">{scorer.jugador}</td>
              <td className="px-4 py-2 border">{scorer.equipo}</td>
              <td className="px-4 py-2 border font-bold">{scorer.goles}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableScorers;
