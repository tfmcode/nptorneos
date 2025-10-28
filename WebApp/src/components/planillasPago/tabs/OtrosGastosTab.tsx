import React from "react";
import { PlanillaOtroGasto } from "../../../types/planillasPago";
import { usePlanillaEdition } from "../../../hooks/usePlanillaEdition";
import { EditableTable, EditableColumn } from "../shared/EditableTable";

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
  const { data, isEditing, handleAdd, handleUpdate, handleDelete, handleSave } =
    usePlanillaEdition({
      entityType: "otro_gasto",
      initialData: otros_gastos,
      idfecha,
      onSuccess,
      onError,
    });

  const columns: EditableColumn<PlanillaOtroGasto>[] = [
    { header: "Orden", accessor: "orden", width: "80px" },
    {
      header: "Tipo Gasto",
      accessor: "codgasto",
      editable: true,
      type: "number",
      render: (g) => g.descripcion_gasto || `Código: ${g.codgasto}`,
      width: "200px",
    },
    {
      header: "Cantidad",
      accessor: "cantidad",
      editable: true,
      type: "number",
      width: "100px",
    },
    {
      header: "Valor/Unidad",
      accessor: "valor_unidad",
      editable: true,
      type: "number",
      render: (g) => `$${g.valor_unidad.toLocaleString()}`,
      width: "120px",
    },
    {
      header: "Total",
      render: (g) => {
        const total = g.cantidad * g.valor_unidad;
        return (
          <span className="font-semibold text-red-700">
            ${total.toLocaleString()}
          </span>
        );
      },
      width: "120px",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold">Egresos - Otros Gastos</h3>
        <button
          onClick={handleSave}
          disabled={isEditing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          💾 Guardar Cambios
        </button>
      </div>
      <EditableTable
        data={data}
        columns={columns}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        isEditing={isEditing}
        addButtonLabel="+ Agregar Gasto"
        emptyMessage="No hay otros gastos registrados"
      />
    </div>
  );
};
