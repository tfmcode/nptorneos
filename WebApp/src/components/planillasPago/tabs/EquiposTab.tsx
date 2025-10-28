import React from "react";
import { PlanillaEquipo } from "../../../types/planillasPago";
import { usePlanillaEdition } from "../../../hooks/usePlanillaEdition";
import { EditableTable, EditableColumn } from "../shared/EditableTable";

interface EquiposTabProps {
  equipos: PlanillaEquipo[];
  idfecha: number;
  partidoInfo?: {
    nombre1?: string;
    nombre2?: string;
  };
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const EquiposTab: React.FC<EquiposTabProps> = ({
  equipos,
  idfecha,
  partidoInfo,
  onSuccess,
  onError,
}) => {
  const { data, isEditing, handleAdd, handleUpdate, handleDelete, handleSave } =
    usePlanillaEdition({
      entityType: "equipo",
      initialData: equipos,
      idfecha,
      onSuccess,
      onError,
    });

  const columns: EditableColumn<PlanillaEquipo>[] = [
    {
      header: "Orden",
      accessor: "orden",
      width: "80px",
    },
    {
      header: "Equipo",
      render: (equipo, index) => {
        if (partidoInfo && index === 0)
          return partidoInfo.nombre1 || "Equipo Local";
        if (partidoInfo && index === 1)
          return partidoInfo.nombre2 || "Equipo Visitante";
        return equipo.nombre_equipo || equipo.idequipo;
      },
      width: "200px",
    },
    {
      header: "Tipo Pago",
      accessor: "tipopago",
      editable: true,
      type: "select",
      options: [
        { label: "Efectivo", value: 1 },
        { label: "Transferencia", value: 2 },
        { label: "Débito Automático", value: 3 },
      ],
      width: "150px",
    },
    {
      header: "Importe",
      accessor: "importe",
      editable: true,
      type: "number",
      render: (equipo) => `$${equipo.importe.toLocaleString()}`,
      width: "120px",
    },
    {
      header: "Depósito",
      accessor: "iddeposito",
      editable: true,
      type: "text",
      width: "120px",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold">Ingresos por Equipos</h3>
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
        addButtonLabel="+ Agregar Equipo"
        emptyMessage="No hay equipos registrados"
      />
    </div>
  );
};
