import React, { useState } from "react";
import { PlanillaOtroGasto } from "../../../types/planillasPago";
import { usePlanillaEdition } from "../../../hooks/usePlanillaEdition";
import { TrashIcon } from "@heroicons/react/24/outline";

interface OtrosGastosTabProps {
  otros_gastos: PlanillaOtroGasto[];
  idfecha: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const OtrosGastosTab: React.FC<OtrosGastosTabProps> = ({
  otros_gastos,
  idfecha,
  onSuccess,
  onError,
}) => {
  const { data, isEditing, handleAdd, handleDelete, handleSave } =
    usePlanillaEdition({
      entityType: "otro_gasto",
      initialData: otros_gastos,
      idfecha,
      onSuccess,
      onError,
    });

  // Estado del formulario
  const [formData, setFormData] = useState({
    codgasto: 0,
    idprofesor: 0,
    cantidad: 0,
    valor_unidad: 0,
  });

  const handleAgregarClick = () => {
    if (formData.codgasto === 0) {
      alert("Debe seleccionar un tipo de gasto");
      return;
    }

    handleAdd();

    // Resetear el formulario
    setFormData({
      codgasto: 0,
      idprofesor: 0,
      cantidad: 0,
      valor_unidad: 0,
    });
  };

  const currency = (n: number) => `$ ${n.toLocaleString("es-AR")}`;
  const calcularTotal = () => formData.cantidad * formData.valor_unidad;
  const calcularTotalGeneral = () =>
    data.reduce((sum, g) => sum + g.cantidad * g.valor_unidad, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold">Egresos - Otros Gastos</h3>
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
              Gasto
            </label>
            <label className="font-bold text-gray-700 h-10 flex items-center">
              Profesor
            </label>
            <label className="font-bold text-gray-700 h-10 flex items-center">
              Cantidad
            </label>
            <label className="font-bold text-gray-700 h-10 flex items-center">
              Valor Unidad
            </label>
            <label className="font-bold text-gray-700 h-10 flex items-center">
              Total $
            </label>
          </div>

          {/* Columna de Inputs */}
          <div className="flex flex-col gap-4 w-[70%]">
            <select
              value={formData.codgasto}
              onChange={(e) =>
                setFormData({ ...formData, codgasto: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              disabled={isEditing}
            >
              <option value={0}>Seleccionar</option>
              {/* Aquí deberías cargar los tipos de gasto disponibles desde tu API */}
              <option value={1}>Gasto 1</option>
              <option value={2}>Gasto 2</option>
            </select>

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
              value={formData.cantidad}
              onChange={(e) =>
                setFormData({ ...formData, cantidad: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              disabled={isEditing}
              placeholder="0.00"
              min="0"
              step="0.01"
            />

            <input
              type="number"
              value={formData.valor_unidad}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  valor_unidad: Number(e.target.value),
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
            onClick={handleAgregarClick}
            disabled={isEditing}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* TABLA DE REGISTROS */}
      <div className="overflow-x-auto border-2 border-gray-300 rounded-lg shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 text-center font-bold border-2 border-gray-300">
                Gasto
              </th>
              <th className="px-3 py-2 text-center font-bold border-2 border-gray-300">
                Profesor
              </th>
              <th className="px-3 py-2 text-center font-bold border-2 border-gray-300">
                Cantidad
              </th>
              <th className="px-3 py-2 text-center font-bold border-2 border-gray-300">
                Valor Unidad
              </th>
              <th className="px-3 py-2 text-center font-bold border-2 border-gray-300">
                Total $
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
                  colSpan={6}
                  className="px-3 py-6 text-center text-gray-500 border border-gray-300"
                >
                  No hay otros gastos registrados
                </td>
              </tr>
            ) : (
              data.map((gasto, index) => (
                <tr
                  key={index}
                  className={`border-b-2 border-gray-300 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="px-3 py-2 text-center border border-gray-300">
                    {gasto.descripcion_gasto || `Código: ${gasto.codgasto}`}
                  </td>
                  <td className="px-3 py-2 text-center border border-gray-300">
                    {gasto.nombre_profesor ? String(gasto.nombre_profesor) : "-"}
                  </td>
                  <td className="px-3 py-2 text-center border border-gray-300">
                    {gasto.cantidad}
                  </td>
                  <td className="px-3 py-2 text-center border border-gray-300">
                    {currency(gasto.valor_unidad)}
                  </td>
                  <td className="px-3 py-2 text-center border border-gray-300 font-semibold">
                    {currency(gasto.cantidad * gasto.valor_unidad)}
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
                  colSpan={4}
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
