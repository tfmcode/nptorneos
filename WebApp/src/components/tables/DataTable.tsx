import { useState } from "react";
import {
  CheckCircleIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { PencilSquareIcon } from "@heroicons/react/24/solid";

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode; // Para renderizar contenido personalizado
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  rowsPerPage?: number;
}

const DataTable = <T extends Record<string, unknown>>({
  columns,
  data,
  onEdit,
  onDelete,
  rowsPerPage = 10,
}: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg p-4">
      {/* Contenedor con scroll y encabezado fijo */}
      <div className="overflow-x-auto max-h-80 border border-gray-300 rounded-lg relative">
        <table className="w-full text-center">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-4 py-2 border">
                  {column.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-2 border">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-4 py-2 border">
                    {column.render
                      ? column.render(row)
                      : String(row[column.accessor!])}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-2 border flex justify-center gap-2">
                    <button
                      onClick={() => onEdit?.(row)}
                      className="px-2 py-1 text-blue-600 hover:text-blue-800"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete?.(row)}
                      className="px-2 py-1 text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    <button
                      className={`px-2 py-1 rounded text-white ${
                        row.enabled
                          ? "bg-green-600 hover:bg-green-800"
                          : "bg-red-600 hover:bg-red-800"
                      }`}
                    >
                      {row.enabled ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <XCircleIcon className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            {"<"}
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            {">"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
