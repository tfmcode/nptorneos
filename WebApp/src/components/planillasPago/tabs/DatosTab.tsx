import React, { useEffect, useState } from "react";
import { PlanillaPago } from "../../../types/planillasPago";
import { Codificador } from "../../../types/codificador";
import { getTurnos } from "../../../api/codificadoresService";

interface DatosTabProps {
  planilla: PlanillaPago;
  onUpdateObserv: (observ: string) => void;
  onUpdateTurno?: (idturno: number) => void;
}

export const DatosTab: React.FC<DatosTabProps> = ({
  planilla,
  onUpdateObserv,
  onUpdateTurno,
}) => {
  const [turnos, setTurnos] = useState<Codificador[]>([]);
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  // ✅ NUEVO: Estado local para el turno seleccionado
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<number>(
    planilla.idturno || 0
  );

  // ✅ NUEVO: Actualizar turno local cuando cambia la planilla
  useEffect(() => {
    setTurnoSeleccionado(planilla.idturno || 0);
  }, [planilla.idturno]);

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
                className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
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
          value={planilla.observ || ""}
          onChange={(e) => onUpdateObserv(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Transferencias, Tiburón $35.000..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Usa este campo para notas generales sobre la jornada
        </p>
      </div>
    </div>
  );
};

interface TotalesTabProps {
  totales: {
    ingreso_inscripciones: number;
    ingreso_depositos: number;
    ingreso_fecha: number;
    total_ingresos: number;
    egreso_arbitros: number;
    egreso_canchas: number;
    egreso_profesores: number;
    egreso_medico: number;
    egreso_otros: number;
    total_egresos: number;
    total_caja: number;
    total_efectivo: number;
    diferencia_caja: number;
  };
  observ_caja?: string;
  onUpdateObservCaja: (observ: string) => void;
}

const currency = (n: number) => `$${n.toLocaleString("es-AR")}`;

export const TotalesTab: React.FC<TotalesTabProps> = ({
  totales,
  observ_caja,
  onUpdateObservCaja,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold">Resumen Financiero</h3>

      <div className="grid grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 bg-green-50">
          <h4 className="text-sm font-semibold text-green-700 mb-3">
            INGRESOS
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Inscripciones</span>
              <span className="font-medium">
                {currency(totales.ingreso_inscripciones)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Depósitos</span>
              <span className="font-medium">
                {currency(totales.ingreso_depositos)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Fecha</span>
              <span className="font-medium">
                {currency(totales.ingreso_fecha)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold text-green-700">
              <span>TOTAL INGRESOS</span>
              <span>{currency(totales.total_ingresos)}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-red-50">
          <h4 className="text-sm font-semibold text-red-700 mb-3">EGRESOS</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Árbitros</span>
              <span className="font-medium">
                {currency(totales.egreso_arbitros)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Canchas</span>
              <span className="font-medium">
                {currency(totales.egreso_canchas)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Profesores</span>
              <span className="font-medium">
                {currency(totales.egreso_profesores)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Serv. Médico</span>
              <span className="font-medium">
                {currency(totales.egreso_medico)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Otros Gastos</span>
              <span className="font-medium">
                {currency(totales.egreso_otros)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold text-red-700">
              <span>TOTAL EGRESOS</span>
              <span>{currency(totales.total_egresos)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
          <div className="text-sm text-gray-600">Total Caja</div>
          <div className="text-2xl font-bold text-blue-600">
            {currency(totales.total_caja)}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
          <div className="text-sm text-gray-600">Total Efectivo</div>
          <div className="text-2xl font-bold text-green-600">
            {currency(totales.total_efectivo)}
          </div>
        </div>
        <div
          className={`p-4 rounded-lg text-center border ${
            totales.diferencia_caja === 0
              ? "bg-gray-50 border-gray-200"
              : totales.diferencia_caja > 0
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="text-sm text-gray-600">Diferencia de Caja</div>
          <div
            className={`text-2xl font-bold ${
              totales.diferencia_caja === 0
                ? "text-gray-600"
                : totales.diferencia_caja > 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {currency(totales.diferencia_caja)}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observación de Cierre de Caja
        </label>
        <textarea
          rows={3}
          value={observ_caja || ""}
          onChange={(e) => onUpdateObservCaja(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: 1 power"
        />
      </div>
    </div>
  );
};
