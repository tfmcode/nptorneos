import React, { useState } from "react";

export interface Card {
  pos: number;
  jugador: string;
  equipo: string;
  amarillas?: number;
  rojas?: number;
  azules?: number;
}

interface TableCardsProps {
  cards: Record<string, Card[]>; // Estructura para pestañas
  tabs: string[];
}

const TableCards: React.FC<TableCardsProps> = ({ cards, tabs }) => {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);

  return (
    <div>
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
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-center mb-8">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border">Pos</th>
              <th className="px-4 py-2 border">Jugador</th>
              <th className="px-4 py-2 border">Equipo</th>
              <th className="px-4 py-2 border text-red-500">🔴</th>
              <th className="px-4 py-2 border text-yellow-500">🟡</th>
              <th className="px-4 py-2 border text-blue-500">🔵</th>
            </tr>
          </thead>
          <tbody>
            {cards[activeTab]?.map((card, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-100 ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="px-4 py-2 border">{card.pos}</td>
                <td className="px-4 py-2 border">{card.jugador}</td>
                <td className="px-4 py-2 border">{card.equipo}</td>
                <td className="px-4 py-2 border">{card.rojas || 0}</td>
                <td className="px-4 py-2 border">{card.amarillas || 0}</td>
                <td className="px-4 py-2 border">{card.azules || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableCards;
