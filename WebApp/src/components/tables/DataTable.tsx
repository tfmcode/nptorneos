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
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onToggleEstado?: (row: T) => void; // Renombrado para manejar ambos (habilitado/codestado)
}

const DataTable = <T extends Record<string, unknown>>({
  columns,
  data,
  onEdit,
  onDelete,
  onToggleEstado, // Maneja habilitado o codestado
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
    if (!sortConfig || !sortConfig.key) return 0;

    const { key, direction } = sortConfig;
    const aValue = a[key] ?? "";
    const bValue = b[key] ?? "";

    const compare = String(aValue).localeCompare(String(bValue), undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return direction === "asc" ? compare : -compare;
  });

  return (
    <div className="w-full mx-auto bg-white shadow-md rounded-lg p-4 min-h-40">
      <div className="overflow-x-auto max-h-80 border border-gray-300 rounded-lg relative">
        <table className="w-full text-center">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-4 py-2 border text-sm">
                  <div className="flex items-center justify-center">
                    {column.header}
                    {column.sortable && column.accessor !== undefined && (
                      <button
                        onClick={() => handleSort(column.accessor as keyof T)}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                      >
                        {sortConfig?.key === column.accessor &&
                        sortConfig?.direction === "asc" ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-[50px] border text-sm">Estado</th>
              <th className="w-[50px] border text-sm">Editar</th>
              <th className="w-[50px] border text-sm">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIndex) => {
              const estado =
                row.habilitado !== undefined ? row.habilitado : row.codestado; // 🔹 Detecta cuál usar
              const isActive = estado === 1;

              return (
                <tr key={rowIndex} className="hover:bg-gray-100 text-sm">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 border">
                      {column.render
                        ? column.render(row)
                        : column.accessor
                        ? String(row[column.accessor] ?? "")
                        : ""}
                    </td>
                  ))}

                  {/* 🔹 Botón de habilitación/deshabilitación dinámico */}
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => onToggleEstado?.(row)}
                      className={`px-2 py-1 rounded text-white ${
                        isActive
                          ? "bg-green-600 hover:bg-green-800"
                          : "bg-red-600 hover:bg-red-800"
                      }`}
                      title={isActive ? "Habilitado" : "Deshabilitado"}
                    >
                      {isActive ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <XCircleIcon className="h-5 w-5" />
                      )}
                    </button>
                  </td>

                  {/* Botón de edición */}
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => onEdit?.(row)}
                      className="px-2 py-1 text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </td>

                  {/* Botón de eliminación */}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
