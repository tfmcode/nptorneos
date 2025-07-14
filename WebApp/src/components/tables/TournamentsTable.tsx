import React, { useState } from "react";

interface GeneralTableItem {
  zona: string;
  columns: string[];
  rows: (string | number | React.ReactNode)[][];
}

interface GeneralTableProps {
  data: GeneralTableItem[];
  itemsPerPage?: number;
  showFichaButton?: boolean;
  onFichaClick?: (row: (string | number | React.ReactNode)[]) => void;
}

const TournamentsTable: React.FC<GeneralTableProps> = ({
  data,
  itemsPerPage = 6,
  showFichaButton = false,
  onFichaClick,
}) => {
  const zonas = data.map((d) => d.zona);
  const [activeZone, setActiveZone] = useState<string>(zonas[0] || "");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const currentData = data.find((d) => d.zona === activeZone);
  const totalPages = Math.ceil((currentData?.rows.length || 0) / itemsPerPage);

  const paginatedRows = currentData?.rows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Tabs de zonas */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {zonas.map((zona) => (
          <button
            key={zona}
            onClick={() => {
              setActiveZone(zona);
              setCurrentPage(1);
            }}
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

      {/* Tabla */}
      <div className="overflow-x-auto">
        <div className="max-h-[288px] overflow-y-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-gray-100 text-gray-700 border-b border-gray-300">
              <tr>
                {currentData?.columns.map((col, idx) => (
                  <th key={idx} className="px-3 py-2 whitespace-nowrap">
                    {col}
                  </th>
                ))}
                {showFichaButton && <th className="px-3 py-2">Ficha</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedRows?.map((row, rowIndex) => (
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
                  {showFichaButton && (
                    <td className="px-3 py-2 border-b border-gray-200">
                      <button
                        className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-xs"
                        onClick={() => onFichaClick?.(row)}
                      >
                        Ficha
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded font-semibold ${
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

export default TournamentsTable;
