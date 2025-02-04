import React, { useState } from "react";

export interface Match {
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
}

const TableMatches: React.FC<TableMatchesProps> = ({
  matches,
  itemsPerPage,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(matches.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPaginatedMatches = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return matches.slice(startIndex, endIndex);
  };

  return (
    <div className="overflow-x-auto">
      {/* Tabla */}
      <table className="w-full border border-gray-300 text-center mb-4">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 border">Local</th>
            <th className="px-4 py-2 border">Goles</th>
            <th className="px-4 py-2 border">Visitante</th>
            <th className="px-4 py-2 border">Goles</th>
            <th className="px-4 py-2 border">Citación</th>
            <th className="px-4 py-2 border">Partido</th>
            <th className="px-4 py-2 border">Fecha</th>
            <th className="px-4 py-2 border">Sede</th>
            <th className="px-4 py-2 border">Ficha</th>
          </tr>
        </thead>
        <tbody>
          {getPaginatedMatches().map((match, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="px-4 py-2 border">{match.local}</td>
              <td
                className={`px-4 py-2 border ${
                  match.golesLocal > match.golesVisitante
                    ? "text-blue-600 font-bold"
                    : ""
                }`}
              >
                {match.golesLocal}
              </td>
              <td className="px-4 py-2 border">{match.visitante}</td>
              <td
                className={`px-4 py-2 border ${
                  match.golesVisitante > match.golesLocal
                    ? "text-blue-600 font-bold"
                    : ""
                }`}
              >
                {match.golesVisitante}
              </td>
              <td className="px-4 py-2 border">{match.citacion}</td>
              <td className="px-4 py-2 border">{match.partido}</td>
              <td className="px-4 py-2 border">{match.fecha}</td>
              <td className="px-4 py-2 border">{match.sede}</td>
              <td className="px-4 py-2 border">
                <button className="px-4 py-1 bg-blue-600 text-white rounded">
                  Ficha
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="flex justify-center items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          {"<"}
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === index + 1
                ? "bg-yellow-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default TableMatches;
