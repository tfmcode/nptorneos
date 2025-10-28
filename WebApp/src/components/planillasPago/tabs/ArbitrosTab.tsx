import React from "react";
import { PlanillaArbitro } from "../../../types/planillasPago";
import { usePlanillaEdition } from "../../../hooks/usePlanillaEdition";
import { EditableTable, EditableColumn } from "../shared/EditableTable";

interface ArbitrosTabProps {
  arbitros: PlanillaArbitro[];
  idfecha: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const ArbitrosTab: React.FC<ArbitrosTabProps> = ({
  arbitros,
  idfecha,
  onSuccess,
  onError,
}) => {
  const { data, isEditing, handleAdd, handleUpdate, handleDelete, handleSave } =
    usePlanillaEdition({
      entityType: "arbitro",
      initialData: arbitros,
      idfecha,
      onSuccess,
      onError,
    });

  const columns: EditableColumn<PlanillaArbitro>[] = [
    {
      header: "Orden",
      accessor: "orden",
      width: "80px",
    },
    {
      header: "Árbitro",
      accessor: "idarbitro",
      editable: true,
      type: "number",
      render: (arbitro) => arbitro.nombre_arbitro || `ID: ${arbitro.idarbitro}`,
      width: "200px",
    },
    {
      header: "Partidos",
      accessor: "partidos",
      editable: true,
      type: "number",
      width: "100px",
    },
    {
      header: "Valor/Partido",
      accessor: "valor_partido",
      editable: true,
      type: "number",
      render: (arbitro) => `$${arbitro.valor_partido.toLocaleString()}`,
      width: "120px",
    },
    {
      header: "Total",
      render: (arbitro) => {
        const total = arbitro.partidos * arbitro.valor_partido;
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
        <h3 className="text-md font-semibold">Egresos - Árbitros</h3>
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
        addButtonLabel="+ Agregar Árbitro"
        emptyMessage="No hay árbitros registrados"
      />
    </div>
  );
};
