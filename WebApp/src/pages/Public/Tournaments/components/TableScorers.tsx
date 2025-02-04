import React, { useState } from "react";

export interface Scorer {
  pos: number;
  jugador: string;
  equipo: string;
  goles: number;
}

interface TableScorersProps {
  scorers: Scorer[];
  tabs: string[];
}

const TableScorers: React.FC<TableScorersProps> = ({ scorers, tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="overflow-x-auto">
      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === tab ? "bg-yellow-600 text-white" : "bg-gray-200"
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
            <th className="px-4 py-2 border">Jugador</th>
            <th className="px-4 py-2 border">Equipo</th>
            <th className="px-4 py-2 border">Goles</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((scorer, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="px-4 py-2 border">{scorer.pos}</td>
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
