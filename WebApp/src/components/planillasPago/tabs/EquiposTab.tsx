// WebApp/src/components/planillasPago/tabs/EquiposTab.tsx
// VERSIÓN SIMPLIFICADA - USA ENDPOINT EXISTENTE

import React, { useState, useEffect, useCallback } from "react";
import { updateEquipoPlanilla } from "../../../api/planillasPagosService";
import { PlanillaEquipo } from "../../../types/planillasPago";
import { EditableTable, EditableColumn } from "../shared/EditableTable";
import API from "../../../api/httpClient";

interface EquiposTabProps {
  idfecha: number;
  isEditable: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const EquiposTab: React.FC<EquiposTabProps> = ({
  idfecha,
  isEditable,
  onSuccess,
  onError,
}) => {
  const [equipos, setEquipos] = useState<PlanillaEquipo[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener equipos desde la planilla completa
  const fetchEquipos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/planillas-pago/${idfecha}`);
      const planillaCompleta = response.data;

      if (planillaCompleta && planillaCompleta.equipos) {
        setEquipos(planillaCompleta.equipos);
      } else {
        setEquipos([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar equipos";
      onError?.(errorMessage);
      console.error("Error al cargar equipos:", err);
      setEquipos([]);
    } finally {
      setLoading(false);
    }
  }, [idfecha, onError]);

  useEffect(() => {
    fetchEquipos();
  }, [fetchEquipos]);

  const handleUpdate = async (
    index: number,
    field: keyof PlanillaEquipo,
    value: unknown
  ) => {
    const equipo = equipos[index];
    if (!equipo) return;

    try {
      // Actualizar localmente primero (optimistic update)
      const updatedEquipos = [...equipos];
      updatedEquipos[index] = { ...equipo, [field]: value };
      setEquipos(updatedEquipos);

      // Actualizar en el backend
      await updateEquipoPlanilla(equipo.idfecha, equipo.orden, {
        [field]: value,
      });

      onSuccess?.();
    } catch (error) {
      // Revertir cambio si falla
      await fetchEquipos();
      const errorMessage =
        error instanceof Error ? error.message : "Error al actualizar equipo";
      onError?.(errorMessage);
    }
  };

  const columns: EditableColumn<PlanillaEquipo>[] = [
    {
      header: "Orden",
      accessor: "orden",
      editable: false,
      width: "80px",
    },
    {
      header: "Equipo",
      accessor: "nombre_equipo",
      editable: false,
      width: "250px",
    },
    {
      header: "Tipo de Pago",
      accessor: "tipopago",
      editable: true,
      type: "select",
      options: [
        { label: "Efectivo (Inscripción)", value: 1 },
        { label: "Transferencia (Depósito)", value: 2 },
        { label: "Débito (Fecha)", value: 3 },
      ],
      width: "200px",
    },
    {
      header: "Importe",
      accessor: "importe",
      editable: true,
      type: "number",
      width: "150px",
      render: (equipo) => {
        return `$${Number(equipo.importe || 0).toLocaleString("es-AR")}`;
      },
    },
    {
      header: "ID Depósito",
      accessor: "iddeposito",
      editable: true,
      type: "number",
      width: "120px",
      render: (equipo) => {
        return equipo.iddeposito || "-";
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Cargando equipos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-md font-semibold">Ingresos por Equipos</h3>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los pagos de inscripción de los equipos
          </p>
        </div>
      </div>

      {equipos.length === 0 ? (
        <div className="border rounded-lg p-8 text-center bg-yellow-50">
          <div className="text-yellow-800 font-medium mb-2">
            ⚠️ No hay equipos registrados en esta caja
          </div>
          <div className="text-sm text-yellow-700">
            Los equipos se crean automáticamente al guardar los datos del
            partido con profesor, fecha y sede completos.
          </div>
        </div>
      ) : (
        <>
          <EditableTable
            data={equipos}
            columns={columns}
            onUpdate={handleUpdate}
            isEditing={isEditable}
            showActions={false}
            emptyMessage="No hay equipos registrados"
          />

          {/* Resumen de totales */}
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-sm text-gray-600">
                  Total Efectivo (Inscripción)
                </div>
                <div className="text-xl font-bold text-green-700">
                  $
                  {equipos
                    .filter((e) => e.tipopago === 1)
                    .reduce((sum, e) => sum + Number(e.importe || 0), 0)
                    .toLocaleString("es-AR")}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-gray-600">
                  Total Transferencias (Depósito)
                </div>
                <div className="text-xl font-bold text-blue-700">
                  $
                  {equipos
                    .filter((e) => e.tipopago === 2)
                    .reduce((sum, e) => sum + Number(e.importe || 0), 0)
                    .toLocaleString("es-AR")}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-sm text-gray-600">
                  Total Débito (Fecha)
                </div>
                <div className="text-xl font-bold text-purple-700">
                  $
                  {equipos
                    .filter((e) => e.tipopago === 3)
                    .reduce((sum, e) => sum + Number(e.importe || 0), 0)
                    .toLocaleString("es-AR")}
                </div>
              </div>
            </div>

            <div className="mt-4 bg-gray-100 p-4 rounded-lg border border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">
                  Total Ingresos por Equipos:
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  $
                  {equipos
                    .reduce((sum, e) => sum + Number(e.importe || 0), 0)
                    .toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
