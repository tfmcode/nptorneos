import { useState } from "react";
import {
  CheckCircleIcon,
  TrashIcon,
  XCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
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
}

const DataTable = <T extends Record<string, unknown>>({
  columns,
  data,
  onEdit,
  onDelete,
}: DataTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const compare = a[key] === b[key] ? 0 : a[key] > b[key] ? 1 : -1; // Comparación básica
    return direction === "asc" ? compare : -compare;
  });

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg p-4">
      {/* Contenedor con scroll y encabezado fijo */}
      <div className="overflow-x-auto max-h-80 border border-gray-300 rounded-lg relative">
        <table className="w-full text-center">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-4 py-2 border text-sm">
                  {column.header}
                </th>
              ))}
              {/* Encabezados para las acciones */}
              <th className="w-[50px] border text-sm">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleSort("enabled" as keyof T)}
                    className="text-gray-600 hover:text-gray-800"
                    title="Ordenar por habilitado"
                  >
                    {sortConfig?.key === "enabled" &&
                    sortConfig.direction === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </th>
              <th className="w-[50px] border text-sm">
              </th>
              <th className="w-[50px] border text-sm">
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100 text-sm">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-4 py-2 border">
                    {column.render
                      ? column.render(row)
                      : String(row[column.accessor!])}
                  </td>
                ))}
                {/* Botones de acciones en columnas separadas */}
                <td className="px-4 py-2 border">
                  <button
                    className={`px-2 py-1 rounded text-white ${
                      row.enabled
                        ? "bg-green-600 hover:bg-green-800"
                        : "bg-red-600 hover:bg-red-800"
                    }`}
                    title={row.enabled ? "Habilitado" : "Deshabilitado"}
                  >
                    {row.enabled ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <XCircleIcon className="h-5 w-5" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => onEdit?.(row)}
                    className="px-2 py-1 text-blue-600 hover:text-blue-800"
                    title="Editar"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => onDelete?.(row)}
                    className="px-2 py-1 text-red-600 hover:text-red-800"
                    title="Eliminar"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
