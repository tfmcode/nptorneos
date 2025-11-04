import React, { useState } from "react";
import { PlanillaProfesor } from "../../../types/planillasPago";
import { usePlanillaEdition } from "../../../hooks/usePlanillaEdition";
import { TrashIcon } from "@heroicons/react/24/outline";

interface ProfesoresTabProps {
  profesores: PlanillaProfesor[];
  idfecha: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const ProfesoresTab: React.FC<ProfesoresTabProps> = ({
  profesores,
  idfecha,
  onSuccess,
  onError,
}) => {
  const { data, isEditing, handleAdd, handleDelete, handleSave } =
    usePlanillaEdition({
      entityType: "profesor",
      initialData: profesores,
      idfecha,
      onSuccess,
      onError,
    });

  // Estado del formulario
  const [formData, setFormData] = useState({
    idprofesor: 0,
    horas: 0,
    valor_hora: 0,
  });

  const handleGrabarClick = () => {
    if (formData.idprofesor === 0) {
      alert("Debe seleccionar un profesor");
      return;
    }

    handleAdd();

    // Resetear el formulario
    setFormData({
      idprofesor: 0,
      horas: 0,
      valor_hora: 0,
    });
  };

  const currency = (n: number) => `$ ${n.toLocaleString("es-AR")}`;
  const calcularTotal = () => formData.horas * formData.valor_hora;
  const calcularTotalGeneral = () =>
    data.reduce((sum, p) => sum + p.horas * p.valor_hora, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold">Egresos - Profesores</h3>
        <button
          onClick={handleSave}
          disabled={isEditing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          💾 Guardar Cambios
        </button>
      </div>

      {/* FORMULARIO DE INGRESO */}
      <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
        <div className="flex gap-4">
          {/* Columna de Labels */}
          <div className="flex flex-col gap-4 w-[30%]">
            <label className="font-bold text-gray-700 h-10 flex items-center">
              Profesor
            </label>
            <label className="font-bold text-gray-700 h-10 flex items-center">
              Horas
            </label>
            <label className="font-bold text-gray-700 h-10 flex items-center">
              Valor Hora
            </label>
            <label className="font-bold text-gray-700 h-10 flex items-center">
              Total
            </label>
          </div>

          {/* Columna de Inputs */}
          <div className="flex flex-col gap-4 w-[70%]">
            <select
              value={formData.idprofesor}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  idprofesor: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              disabled={isEditing}
            >
              <option value={0}>Seleccionar</option>
              {/* Aquí deberías cargar los profesores disponibles desde tu API */}
              <option value={1}>Profesor 1</option>
              <option value={2}>Profesor 2</option>
            </select>

            <input
              type="number"
              value={formData.horas}
              onChange={(e) =>
                setFormData({ ...formData, horas: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              disabled={isEditing}
              placeholder="0.00"
              min="0"
              step="0.01"
            />

            <input
              type="number"
              value={formData.valor_hora}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  valor_hora: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              disabled={isEditing}
              placeholder="$ 0.00"
              min="0"
              step="0.01"
            />

            <input
              type="text"
              value={currency(calcularTotal())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 font-semibold"
              disabled
            />
          </div>
        </div>

        <div className="mt-4 w-1/3">
          <button
            onClick={handleGrabarClick}
            disabled={isEditing}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Grabar
          </button>
        </div>
      </div>

      {/* TABLA DE REGISTROS */}
      <div className="overflow-x-auto border-2 border-gray-300 rounded-lg shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 text-center font-bold border-2 border-gray-300">
                Profesor
              </th>
              <th className="px-3 py-2 text-center font-bold border-2 border-gray-300">
                Horas
              </th>
              <th className="px-3 py-2 text-center font-bold border-2 border-gray-300">
                Valor Hora
              </th>
              <th className="px-3 py-2 text-center font-bold border-2 border-gray-300">
                Total
              </th>
              <th className="px-3 py-2 text-center font-bold border-2 border-gray-300 w-20">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-gray-500 border border-gray-300"
                >
                  No hay profesores registrados
                </td>
              </tr>
            ) : (
              data.map((profesor, index) => (
                <tr
                  key={index}
                  className={`border-b-2 border-gray-300 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="px-3 py-2 text-center border border-gray-300">
                    {profesor.nombre_profesor || `ID: ${profesor.idprofesor}`}
                  </td>
                  <td className="px-3 py-2 text-center border border-gray-300">
                    {profesor.horas}
                  </td>
                  <td className="px-3 py-2 text-center border border-gray-300">
                    {currency(profesor.valor_hora)}
                  </td>
                  <td className="px-3 py-2 text-center border border-gray-300 font-semibold">
                    {currency(profesor.horas * profesor.valor_hora)}
                  </td>
                  <td className="px-3 py-2 text-center border border-gray-300">
                    <button
                      onClick={() => handleDelete(index)}
                      disabled={isEditing}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-5 w-5 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))
            )}
            {/* Fila TOTAL */}
            {data.length > 0 && (
              <tr className="bg-gray-200 font-bold">
                <td
                  colSpan={3}
                  className="px-3 py-2 text-center border-2 border-gray-300"
                >
                  TOTAL
                </td>
                <td className="px-3 py-2 text-center border-2 border-gray-300">
                  {currency(calcularTotalGeneral())}
                </td>
                <td className="border-2 border-gray-300"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
