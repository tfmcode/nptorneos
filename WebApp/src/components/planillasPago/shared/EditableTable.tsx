import React from "react";
import { TrashIcon } from "@heroicons/react/24/outline";

export interface EditableColumn<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T, index: number) => React.ReactNode;
  editable?: boolean;
  type?: "text" | "number" | "select" | "custom";
  options?: { label: string; value: string | number }[];
  onChange?: (index: number, value: unknown) => void;
  width?: string;
}

interface EditableTableProps<T> {
  data: T[];
  columns: EditableColumn<T>[];
  onAdd?: () => void;
  onDelete?: (index: number) => void;
  onUpdate?: (index: number, field: keyof T, value: unknown) => void;
  isEditing?: boolean;
  addButtonLabel?: string;
  emptyMessage?: string;
  showActions?: boolean;
}

export function EditableTable<T>({
  data,
  columns,
  onAdd,
  onDelete,
  onUpdate,
  isEditing = false,
  addButtonLabel = "+ Agregar",
  emptyMessage = "No hay registros",
  showActions = true,
}: EditableTableProps<T>) {
  const renderCell = (
    column: EditableColumn<T>,
    item: T,
    index: number
  ): React.ReactNode => {
    // Si tiene render personalizado, usarlo
    if (column.render) {
      return column.render(item, index);
    }

    // Si no es editable o no hay accessor, mostrar valor
    if (!column.editable || !column.accessor) {
      return column.accessor ? String(item[column.accessor] ?? "") : "";
    }

    const value = item[column.accessor];

    // Renderizar según tipo
    switch (column.type) {
      case "select":
        return (
          <select
            value={String(value ?? "")}
            onChange={(e) => {
              const newValue =
                column.type === "number"
                  ? Number(e.target.value)
                  : e.target.value;
              onUpdate?.(index, column.accessor as keyof T, newValue);
            }}
            className="w-full px-2 py-1 border rounded text-sm"
            disabled={isEditing}
          >
            <option value="">Seleccionar...</option>
            {column.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "number":
        return (
          <input
            type="number"
            value={Number(value ?? 0)}
            onChange={(e) =>
              onUpdate?.(
                index,
                column.accessor as keyof T,
                Number(e.target.value)
              )
            }
            className="w-full px-2 py-1 border rounded text-sm"
            disabled={isEditing}
          />
        );

      case "text":
      default:
        return (
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) =>
              onUpdate?.(index, column.accessor as keyof T, e.target.value)
            }
            className="w-full px-2 py-1 border rounded text-sm"
            disabled={isEditing}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Botón Agregar */}
      {onAdd && (
        <div className="flex justify-end">
          <button
            onClick={onAdd}
            disabled={isEditing}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addButtonLabel}
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-3 py-2 text-left font-semibold"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
              {showActions && onDelete && (
                <th className="px-3 py-2 text-center w-20">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions && onDelete ? 1 : 0)}
                  className="px-3 py-6 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-3 py-2">
                      {renderCell(col, item, index)}
                    </td>
                  ))}
                  {showActions && onDelete && (
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => onDelete(index)}
                        disabled={isEditing}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
