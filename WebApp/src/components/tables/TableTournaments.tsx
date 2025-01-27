import React from "react";

interface TableProps {
  headers: string[]; // Encabezados de la tabla
  data: Array<{ [key: string]: string | number | boolean }>; // Datos de la tabla (array de objetos)
  renderRow: (
    item: { [key: string]: string | number | boolean },
    index: number
  ) => React.ReactNode; // Función para renderizar filas
}

export const TableTournaments: React.FC<TableProps> = ({
  headers,
  data,
  renderRow,
}) => {
  return (
    <div className="overflow-x-auto mb-8">
      <table className="w-full border border-gray-300 text-center">
        <thead className="bg-gray-200">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-2 border">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-100">
              {renderRow(item, index)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
