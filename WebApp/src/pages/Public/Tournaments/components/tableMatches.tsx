// components/TableMatches.tsx
import React, { useState } from "react";

export interface Match {
  id: number;
  zona: string;
  local: string;
  visitante: string;
  golesLocal: number;
  golesVisitante: number;
  citacion: string;
  partido: string;
  fecha: string;
  sede: string;
}

interface TableMatchesProps {
  matches: Match[];
  itemsPerPage: number;
  onSelectMatch?: (idpartido: number) => void; // ✅ nueva prop
}

const TableMatches: React.FC<TableMatchesProps> = ({
  matches,
  itemsPerPage,
  onSelectMatch,
}) => {
  const [activeZone, setActiveZone] = useState<string>(matches[0]?.zona || "");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const zones = Array.from(new Set(matches.map((m) => m.zona))).sort();
  const filteredMatches = matches.filter((m) => m.zona === activeZone);
  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const paginatedMatches = filteredMatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {zones.map((zone) => (
          <button
            key={zone}
            onClick={() => {
              setActiveZone(zone);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded font-semibold ${
              activeZone === zone ? "bg-yellow-600 text-white" : "bg-gray-200"
            }`}
          >
            {zone.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-center mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 border">Local</th>
              <th className="px-2 py-1 border">Goles</th>
              <th className="px-2 py-1 border">Visitante</th>
              <th className="px-2 py-1 border">Goles</th>
              <th className="px-2 py-1 border">Citación</th>
              <th className="px-2 py-1 border">Partido</th>
              <th className="px-2 py-1 border">Fecha</th>
              <th className="px-2 py-1 border">Sede</th>
              <th className="px-2 py-1 border">Ficha</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMatches.map((match) => (
              <tr key={match.id} className="hover:bg-gray-50">
                <td className="px-2 py-1 border font-semibold text-blue-700">
                  {match.local}
                </td>
                <td
                  className={`px-2 py-1 border ${
                    match.golesLocal > match.golesVisitante
                      ? "text-blue-600 font-bold"
                      : ""
                  }`}
                >
                  {match.golesLocal}
                </td>
                <td className="px-2 py-1 border font-semibold text-blue-700">
                  {match.visitante}
                </td>
                <td
                  className={`px-2 py-1 border ${
                    match.golesVisitante > match.golesLocal
                      ? "text-blue-600 font-bold"
                      : ""
                  }`}
                >
                  {match.golesVisitante}
                </td>
                <td className="px-2 py-1 border">{match.citacion}</td>
                <td className="px-2 py-1 border">{match.partido}</td>
                <td className="px-2 py-1 border">{match.fecha}</td>
                <td className="px-2 py-1 border">{match.sede}</td>
                <td className="px-2 py-1 border">
                  <button
                    className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-xs"
                    onClick={() => onSelectMatch?.(match.id)}
                  >
                    Ficha
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableMatches;
