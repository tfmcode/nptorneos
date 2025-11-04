import React from "react";
import { TrashIcon } from "@heroicons/react/24/outline";

export interface ColumnaTabla<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
  className?: string;
}

interface TablaGenericaProps<T> {
  columnas: ColumnaTabla<T>[];
  datos: T[];
  onDelete?: (index: number) => void;
  mensajeVacio?: string;
  mostrarAcciones?: boolean;
  mostrarTotal?: boolean;
  calcularTotal?: () => string;
  columnasTotal?: number;
  disabled?: boolean;
  filaTotal?: React.ReactNode;
}

const alineaciones = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function TablaGenerica<T>({
  columnas,
  datos,
  onDelete,
  mensajeVacio = "No hay registros",
  mostrarAcciones = true,
  mostrarTotal = false,
  calcularTotal,
  columnasTotal = 3,
  disabled = false,
  filaTotal,
}: TablaGenericaProps<T>) {
  const renderCelda = (columna: ColumnaTabla<T>, item: T, index: number) => {
    if (columna.render) {
      return columna.render(item, index);
    }

    if (columna.accessor) {
      const valor = item[columna.accessor];
      return String(valor ?? "");
    }

    return "";
  };

  return (
    <div className="overflow-x-auto border-2 border-gray-300 rounded-lg shadow-lg">
      <table className="w-full text-sm border-collapse">
        {/* Encabezado */}
        <thead>
          <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
            {columnas.map((col, idx) => (
              <th
                key={idx}
                className={`
                  px-3 py-3 font-bold border-2 border-gray-300
                  ${alineaciones[col.align || "center"]}
                  ${col.className || ""}
                `}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
            {mostrarAcciones && onDelete && (
              <th className="px-3 py-3 text-center font-bold border-2 border-gray-300 w-20">
                Acciones
              </th>
            )}
          </tr>
        </thead>

        {/* Cuerpo */}
        <tbody>
          {datos.length === 0 ? (
            <tr>
              <td
                colSpan={
                  columnas.length + (mostrarAcciones && onDelete ? 1 : 0)
                }
                className="px-3 py-8 text-center text-gray-500 border border-gray-300 bg-yellow-50"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">📋</span>
                  <span className="font-medium">{mensajeVacio}</span>
                </div>
              </td>
            </tr>
          ) : (
            <>
              {datos.map((item, index) => (
                <tr
                  key={index}
                  className={`
                    border-b-2 border-gray-300 transition-colors
                    ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    hover:bg-blue-50
                  `}
                >
                  {columnas.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`
                        px-3 py-2 border border-gray-300
                        ${alineaciones[col.align || "center"]}
                        ${col.className || ""}
                      `}
                    >
                      {renderCelda(col, item, index)}
                    </td>
                  ))}
                  {mostrarAcciones && onDelete && (
                    <td className="px-3 py-2 text-center border border-gray-300">
                      <button
                        onClick={() => onDelete(index)}
                        disabled={disabled}
                        className="
                          inline-flex items-center justify-center
                          w-8 h-8 rounded-full
                          text-red-600 hover:text-white hover:bg-red-600
                          transition-all disabled:opacity-50 disabled:cursor-not-allowed
                        "
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {/* Fila de Total */}
              {mostrarTotal && datos.length > 0 && (
                <tr className="bg-gradient-to-r from-gray-200 to-gray-300 font-bold">
                  {filaTotal ? (
                    filaTotal
                  ) : (
                    <>
                      <td
                        colSpan={columnasTotal}
                        className="px-3 py-3 text-center border-2 border-gray-400 text-gray-800"
                      >
                        TOTAL
                      </td>
                      <td className="px-3 py-3 text-center border-2 border-gray-400 text-gray-800">
                        {calcularTotal ? calcularTotal() : ""}
                      </td>
                      {mostrarAcciones && onDelete && (
                        <td className="border-2 border-gray-400"></td>
                      )}
                    </>
                  )}
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
