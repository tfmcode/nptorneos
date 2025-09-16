import { useState } from "react";
import {
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface JugadoresDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  setData: (data: T[]) => void;
  disabled?: boolean;
  showActions?: boolean; // Nueva propiedad para controlar si mostrar acciones
}

const JugadoresDataTable = <T extends Record<string, unknown>>({
  columns,
  data,
  setData,
  disabled = false,
  showActions = true, // Por defecto mostrar acciones
}: JugadoresDataTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);

  // Manejar cambio de checkbox (capitán/subcapitán)
  const handleCheckChange = (row: T, field: keyof T) => {
    if (disabled) return;

    const newData = data.map((r) => {
      if (r.id === row.id) {
        // Si estamos marcando capitán, desmarcar todos los otros capitanes
        if (field === "capitan") {
          return { ...r, [field]: 1 };
        }
        return { ...r, [field]: r[field] === 1 ? 0 : 1 };
      } else {
        // Si estamos marcando capitán en uno, desmarcar en todos los otros
        if (field === "capitan") {
          return { ...r, [field]: 0 };
        }
        return r;
      }
    });
    setData(newData);
  };

  // Manejar eliminación de jugador
  const handleDelete = (row: T) => {
    if (disabled) return;
    const newData = data.filter((r) => r.id !== row.id);
    setData(newData);
  };

  // Manejar cambios en inputs editables
  const handleInputChange = (row: T, field: keyof T, value: string) => {
    if (disabled) return;

    const newData = data.map((r) => {
      if (r.id === row.id) {
        // Convertir valores según el tipo de campo
        let processedValue: string | number | undefined = value;
        if (field === "docnro") {
          processedValue = value ? parseInt(value) || 0 : 0;
        } else if (field === "posicion") {
          processedValue = value ? parseInt(value) || undefined : undefined;
        }

        return { ...r, [field]: processedValue };
      }
      return r;
    });
    setData(newData);
  };

  // Obtener icono de estado del jugador
  const getRowStatusIcon = (row: T) => {
    if (row.listanegra === true) {
      return (
        <ExclamationTriangleIcon
          className="h-4 w-4 text-red-600"
          title="Jugador en lista negra"
        />
      );
    }
    if (row.sancion === true) {
      return (
        <ExclamationTriangleIcon
          className="h-4 w-4 text-orange-500"
          title="Jugador con sanción activa"
        />
      );
    }
    if (row.jugadorexistente === true) {
      return (
        <CheckCircleIcon
          className="h-4 w-4 text-blue-500"
          title="Jugador ya registrado en el sistema"
        />
      );
    }
    return null;
  };

  // Obtener clase CSS para la fila según el estado
  const getRowClassName = (row: T) => {
    const baseClass = "hover:bg-gray-50 text-sm transition-colors";

    if (row.listanegra === true) {
      return `${baseClass} bg-red-900 text-white`;
    }
    if (row.sancion === true) {
      return `${baseClass} bg-red-100 border-red-200`;
    }
    if (row.jugadorexistente === true) {
      return `${baseClass} bg-yellow-50 border-yellow-200`;
    }

    return baseClass;
  };

  // Validar si un campo tiene error
  const validateField = (row: T, field: keyof T) => {
    const value = row[field];

    switch (field) {
      case "apellido":
      case "nombres":
      case "telefono":
        return (
          !value || (typeof value === "string" && value.trim().length === 0)
        );
      case "docnro":
        return !value || value === 0;
      case "fhnacimiento":
        return !value;
      default:
        return false;
    }
  };

  // Manejar ordenamiento
  const handleSort = (key: keyof T) => {
    setSortConfig((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  // Aplicar ordenamiento
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
      {/* Leyenda de estados */}
      <div className="flex justify-center gap-6 my-4 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-blue-500" />
          <span className="text-gray-700">Jugador Existente</span>
        </div>
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
          <span className="text-gray-700">Con Sanción</span>
        </div>
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
          <span className="text-gray-700">Lista Negra</span>
        </div>
      </div>

      <div className="overflow-x-auto max-h-96 border border-gray-300 rounded-lg relative">
        <table className="w-full text-center">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-2 border text-xs font-medium w-12">
                Estado
              </th>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-3 py-2 border text-xs font-medium ${
                    column.width || ""
                  }`}
                  style={column.width ? { width: column.width } : {}}
                >
                  <div className="flex items-center justify-center">
                    {column.header}
                    {column.sortable && column.accessor !== undefined && (
                      <button
                        onClick={() => handleSort(column.accessor as keyof T)}
                        className="ml-1 text-gray-600 hover:text-gray-800"
                      >
                        {sortConfig?.key === column.accessor &&
                        sortConfig?.direction === "asc" ? (
                          <ChevronUpIcon className="h-3 w-3" />
                        ) : (
                          <ChevronDownIcon className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-2 py-2 border text-xs font-medium w-16">
                Cap.
              </th>
              <th className="px-2 py-2 border text-xs font-medium w-16">
                S.Cap.
              </th>
              {showActions && (
                <th className="w-12 border text-xs font-medium">Acción</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIndex) => {
              return (
                <tr key={rowIndex} className={getRowClassName(row)}>
                  {/* Columna de estado */}
                  <td className="px-2 py-2 border">{getRowStatusIcon(row)}</td>

                  {/* Columnas de datos */}
                  {columns.map((column, colIndex) => {
                    // Si la columna tiene un render personalizado, usarlo
                    if (column.render) {
                      return (
                        <td key={colIndex} className="px-2 py-2 border">
                          {column.render(row)}
                        </td>
                      );
                    }

                    const hasError = validateField(
                      row,
                      column.accessor as keyof T
                    );
                    const isReadOnlyField =
                      row.jugadorexistente === true &&
                      (column.accessor === "apellido" ||
                        column.accessor === "nombres");

                    return (
                      <td key={colIndex} className="px-2 py-2 border">
                        <input
                          type={
                            column.accessor === "posicion"
                              ? "number"
                              : column.accessor === "fhnacimiento"
                              ? "date"
                              : column.accessor === "email"
                              ? "email"
                              : column.accessor === "docnro"
                              ? "number"
                              : "text"
                          }
                          value={
                            column.accessor
                              ? String(row[column.accessor] ?? "")
                              : ""
                          }
                          onChange={(e) =>
                            handleInputChange(
                              row,
                              column.accessor as keyof T,
                              e.target.value
                            )
                          }
                          disabled={disabled || isReadOnlyField}
                          className={`w-full px-2 py-1 text-xs border-0 bg-transparent focus:bg-white focus:shadow-inner focus:border focus:border-blue-300 rounded ${
                            hasError ? "bg-red-50 text-red-700" : ""
                          } ${
                            isReadOnlyField
                              ? "bg-gray-100 cursor-not-allowed opacity-60"
                              : ""
                          }`}
                          placeholder={hasError ? "Requerido" : ""}
                          title={
                            isReadOnlyField
                              ? "Este campo no se puede editar para jugadores existentes"
                              : undefined
                          }
                        />
                      </td>
                    );
                  })}

                  {/* Capitán */}
                  <td className="px-2 py-2 border">
                    <input
                      type="checkbox"
                      checked={row.capitan === 1}
                      onChange={() => handleCheckChange(row, "capitan")}
                      disabled={disabled}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>

                  {/* Subcapitán */}
                  <td className="px-2 py-2 border">
                    <input
                      type="checkbox"
                      checked={row.subcapitan === 1}
                      onChange={() => handleCheckChange(row, "subcapitan")}
                      disabled={disabled}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>

                  {/* Botón de eliminación - solo si showActions es true */}
                  {showActions && (
                    <td className="px-2 py-2 border">
                      <button
                        onClick={() => handleDelete(row)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar jugador"
                        disabled={disabled}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Información adicional */}
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay jugadores agregados.
        </div>
      )}

      {data.length > 0 && (
        <div className="mt-3 text-xs text-gray-600 space-y-1">
          <div>
            <strong>Total:</strong> {data.length} jugadores |
            <strong>Capitanes:</strong>{" "}
            {data.filter((j: T) => j.capitan === 1).length} |
            <strong>Subcapitanes:</strong>{" "}
            {data.filter((j: T) => j.subcapitan === 1).length}
          </div>
          <div>
            <strong>Nota:</strong> Los campos en gris no se pueden editar para
            jugadores existentes. Solo puede haber un capitán por equipo.
          </div>
        </div>
      )}
    </div>
  );
};

export default JugadoresDataTable;
