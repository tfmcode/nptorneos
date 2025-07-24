import { TrashIcon } from "@heroicons/react/24/outline";

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => string;
}

interface JugadoresDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  setData: (data: T[]) => void;
  disabled?: boolean;
}

const JugadoresDataTable = <T extends Record<string, unknown>>({
  columns,
  data,
  setData,
  disabled,
}: JugadoresDataTableProps<T>) => {
  const handleCheckChange = (row: T, field: keyof T) => {
    const newData = data.map((r) => {
      if (r.id === row.id) {
        return { ...r, [field]: 1 };
      } else {
        return { ...r, [field]: 0 };
      }
    });
    setData(newData);
  };

  const handleDelete = (row: T) => {
    const newData = data.filter((r) => r.id !== row.id);
    setData(newData);
  };

  const handleInputChange = (row: T, field: keyof T, value: string) => {
    const newData = data.map((r) => {
      if (r.id === row.id) {
        return { ...r, [field]: value };
      }
      return r;
    });
    setData(newData);
  };

  return (
    <div className="w-full mx-auto bg-white shadow-md rounded-lg p-4 min-h-40">
      <div className="flex justify-center gap-4 my-4">
        <div className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded bg-yellow-100 border border-yellow-400"></span>
          <span className="text-xs text-gray-700">Existente</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded bg-red-100 border border-red-400"></span>
          <span className="text-xs text-gray-700">Sancionado</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded bg-gray-600 border border-gray-400"></span>
          <span className="text-xs text-gray-700">Lista Negra</span>
        </div>
      </div>
      <div className="overflow-x-auto max-h-80 border border-gray-300 rounded-lg relative">
        <table className="w-full text-center">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-4 py-2 border text-sm">
                  {column.header}
                </th>
              ))}
              <th className="px-4 py-2 border text-sm">Cap.</th>
              <th className="px-4 py-2 border text-sm">S.Cap.</th>
              <th className="w-[50px] border text-sm"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              return (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-100 text-sm ${
                    row.listanegra === true
                      ? "bg-gray-600"
                      : row.sancion === true
                      ? "bg-red-100"
                      : row.jugadorexistente === true
                      ? "bg-yellow-100"
                      : ""
                  }`}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 border">
                      <input
                        type={
                          column.accessor === "posicion"
                            ? "number"
                            : column.accessor === "fhnacimiento"
                            ? "date"
                            : column.accessor === "email"
                            ? "email"
                            : "text"
                        }
                        value={
                          column.render
                            ? column.render(row)
                            : column.accessor
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
                        disabled={disabled}
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2 border">
                    <input
                      type="checkbox"
                      checked={row.capitan === 1}
                      onChange={() => handleCheckChange(row, "capitan")}
                      disabled={disabled}
                    />
                  </td>
                  <td className="px-4 py-2 border">
                    <input
                      type="checkbox"
                      checked={row.subcapitan === 1}
                      onChange={() => handleCheckChange(row, "subcapitan")}
                      disabled={disabled}
                    />
                  </td>

                  {/* Botón de eliminación */}
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleDelete(row)}
                      className="px-2 py-1 text-red-600 hover:text-red-800"
                      title="Eliminar"
                      disabled={disabled}
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

export default JugadoresDataTable;
