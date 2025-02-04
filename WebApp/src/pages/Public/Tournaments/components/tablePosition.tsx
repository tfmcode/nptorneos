import React, { useState } from "react";

export interface Position {
  pos: number;
  equipo: string;
  pts: number;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dif: number;
  pb: number;
}

interface TablePositionProps {
  positions: Record<string, Position[]>; // Soporte para múltiples pestañas
  tabs: string[]; // Lista de pestañas
}

const TablePosition: React.FC<TablePositionProps> = ({ positions, tabs }) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]); // Tab activa inicial

  return (
    <div className="overflow-x-auto">
      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === tab
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <table className="w-full border border-gray-300 text-center mb-8">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 border">Pos</th>
            <th className="px-4 py-2 border">Equipo</th>
            <th className="px-4 py-2 border">PTS</th>
            <th className="px-4 py-2 border">PJ</th>
            <th className="px-4 py-2 border">PG</th>
            <th className="px-4 py-2 border">PE</th>
            <th className="px-4 py-2 border">PP</th>
            <th className="px-4 py-2 border">GF</th>
            <th className="px-4 py-2 border">GC</th>
            <th className="px-4 py-2 border">DIF</th>
            <th className="px-4 py-2 border">PB</th>
          </tr>
        </thead>
        <tbody>
          {positions[activeTab]?.map((position, index) => (
            <tr
              key={index}
              className={`hover:bg-gray-100 ${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              }`}
            >
              <td className="px-4 py-2 border">{position.pos}</td>
              <td className="px-4 py-2 border">{position.equipo}</td>
              <td className="px-4 py-2 border text-blue-600 font-bold">
                {position.pts}
              </td>
              <td className="px-4 py-2 border">{position.pj}</td>
              <td className="px-4 py-2 border">{position.pg}</td>
              <td className="px-4 py-2 border">{position.pe}</td>
              <td className="px-4 py-2 border">{position.pp}</td>
              <td className="px-4 py-2 border">{position.gf}</td>
              <td className="px-4 py-2 border">{position.gc}</td>
              <td className="px-4 py-2 border">{position.dif}</td>
              <td className="px-4 py-2 border">{position.pb}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablePosition;
