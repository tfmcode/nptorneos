import React, { useEffect, useState } from "react";
import { PlanillaPago } from "../../../types/planillasPago";
import { Codificador } from "../../../types/codificador";
import { getTurnos } from "../../../api/codificadoresService";

interface DatosTabProps {
  planilla: PlanillaPago;
  isEditable?: boolean;
  onUpdateObserv: (observ: string) => void;
  onUpdateTurno?: (idturno: number) => void;
}

export const DatosTab: React.FC<DatosTabProps> = ({
  planilla,
  isEditable = true,
  onUpdateObserv,
  onUpdateTurno,
}) => {
  const [turnos, setTurnos] = useState<Codificador[]>([]);
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<number>(
    planilla.idturno || 0
  );
  // Estado local para observaciones (evita textarea no editable)
  const [localObserv, setLocalObserv] = useState(planilla.observ || "");

  useEffect(() => {
    setTurnoSeleccionado(planilla.idturno || 0);
  }, [planilla.idturno]);

  useEffect(() => {
    setLocalObserv(planilla.observ || "");
  }, [planilla.observ]);

  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const turnosData = await getTurnos();
        setTurnos(turnosData);
      } catch (error) {
        console.error("Error al cargar turnos:", error);
      } finally {
        setLoadingTurnos(false);
      }
    };
    cargarTurnos();
  }, []);

  // ✅ NUEVO: Función para manejar cambio de turno
  const handleTurnoChange = async (nuevoTurno: number) => {
    setTurnoSeleccionado(nuevoTurno); // Actualizar UI inmediatamente
    if (onUpdateTurno) {
      await onUpdateTurno(nuevoTurno); // Guardar en backend
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold">Información General</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha
          </label>
          <input
            type="date"
            value={
              planilla.fecha
                ? new Date(planilla.fecha).toISOString().split("T")[0]
                : ""
            }
            className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-50"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Número de Fecha
          </label>
          <input
            type="text"
            value={planilla.codfecha || "-"}
            className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-50"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sede
          </label>
          <input
            type="text"
            value={planilla.sede_nombre || "-"}
            className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-50"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Torneo
          </label>
          <input
            type="text"
            value={planilla.torneo_nombre || planilla.torneo || "-"}
            className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-50"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Profesor Asignado
          </label>
          <input
            type="text"
            value={planilla.profesor_nombre || "Sin asignar"}
            className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-50"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Turno
          </label>
          {loadingTurnos ? (
            <input
              type="text"
              value="Cargando turnos..."
              className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-50"
              disabled
            />
          ) : (
            <>
              <select
                value={turnoSeleccionado}
                disabled={!isEditable}
                className={`mt-1 w-full px-3 py-2 border rounded-md ${isEditable ? "focus:ring-2 focus:ring-blue-500" : "bg-gray-50 text-gray-500 cursor-not-allowed"}`}
                onChange={(e) => {
                  handleTurnoChange(Number(e.target.value));
                }}
              >
                <option value={0}>Sin especificar</option>
                {turnos.map((turno) => (
                  <option key={turno.id} value={turno.id}>
                    {turno.descripcion}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h4 className="text-md font-semibold mb-3 text-blue-800">
          Estado de la Planilla
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Fecha de Carga:</span>
            <div className="text-gray-600">
              {planilla.fhcarga
                ? new Date(planilla.fhcarga).toLocaleString("es-AR")
                : "-"}
            </div>
          </div>

          <div>
            <span className="font-medium text-gray-700">Fecha de Cierre:</span>
            <div className="text-gray-600">
              {planilla.fhcierre
                ? new Date(planilla.fhcierre).toLocaleString("es-AR")
                : "No cerrada"}
            </div>
          </div>

          <div>
            <span className="font-medium text-gray-700">
              Profesor que Cerró:
            </span>
            <div className="text-gray-600">
              {planilla.profesor_cierre_nombre || "-"}
            </div>
          </div>

          <div>
            <span className="font-medium text-gray-700">
              Fecha Contabilizada:
            </span>
            <div className="text-gray-600">
              {planilla.fhcierrecaja
                ? new Date(planilla.fhcierrecaja).toLocaleString("es-AR")
                : "No contabilizada"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones
        </label>
        <textarea
          rows={4}
          value={localObserv}
          disabled={!isEditable}
          onChange={(e) => {
            setLocalObserv(e.target.value);
            onUpdateObserv(e.target.value);
          }}
          className={`w-full px-3 py-2 border rounded-md ${isEditable ? "focus:ring-2 focus:ring-blue-500" : "bg-gray-50 text-gray-500"}`}
          placeholder="Ej: Transferencias, Tiburón $35.000..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Usa este campo para notas generales sobre la jornada
        </p>
      </div>
    </div>
  );
};

