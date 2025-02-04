interface Column<T> {
  header: string;
  accessor: keyof T;
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
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 text-center mb-4">
        <thead className="bg-gray-200">
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
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-100">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-4 py-2 border">
                  {String(row[column.accessor])}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-2 border">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
