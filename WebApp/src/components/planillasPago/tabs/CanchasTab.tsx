import React from "react";
import { PlanillaCancha } from "../../../types/planillasPago";
import { usePlanillaEdition } from "../../../hooks/usePlanillaEdition";
import { EditableTable, EditableColumn } from "../shared/EditableTable";

// ===== CANCHAS =====
interface CanchasTabProps {
  canchas: PlanillaCancha[];
  idfecha: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const CanchasTab: React.FC<CanchasTabProps> = ({
  canchas,
  idfecha,
  onSuccess,
  onError,
}) => {
  const { data, isEditing, handleAdd, handleUpdate, handleDelete, handleSave } =
    usePlanillaEdition({
      entityType: "cancha",
      initialData: canchas,
      idfecha,
      onSuccess,
      onError,
    });

  const columns: EditableColumn<PlanillaCancha>[] = [
    { header: "Orden", accessor: "orden", width: "80px" },
    {
      header: "Horas",
      accessor: "horas",
      editable: true,
      type: "number",
      width: "100px",
    },
    {
      header: "Valor/Hora",
      accessor: "valor_hora",
      editable: true,
      type: "number",
      render: (c) => `$${c.valor_hora.toLocaleString()}`,
      width: "120px",
    },
    {
      header: "Total",
      render: (c) => {
        const total = c.horas * c.valor_hora;
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
        <h3 className="text-md font-semibold">Egresos - Canchas</h3>
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
        addButtonLabel="+ Agregar Cancha"
        emptyMessage="No hay canchas registradas"
      />
    </div>
  );
};
