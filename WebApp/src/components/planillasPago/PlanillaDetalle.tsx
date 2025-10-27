// Ubicación: WebApp/src/components/planillasPago/PlanillaDetalleMejorado.tsx

import React from "react";
import { PlanillaCompleta } from "../../types/planillasPago";
import {
  CalendarIcon,
  MapPinIcon,
  TrophyIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

type Props = {
  planillaCompleta: PlanillaCompleta;
  onClose: () => void;
};

const currency = (n: number | undefined | null) =>
  typeof n === "number"
    ? n.toLocaleString("es-AR", { style: "currency", currency: "ARS" })
    : "$0,00";

const Badge: React.FC<{
  text: string;
  color: "green" | "yellow" | "gray" | "blue" | "red" | "indigo";
}> = ({ text, color }) => {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-800 border-green-300",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
    gray: "bg-gray-100 text-gray-800 border-gray-300",
    blue: "bg-blue-100 text-blue-800 border-blue-300",
    red: "bg-red-100 text-red-800 border-red-300",
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-300",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colorMap[color]}`}
    >
      {text}
    </span>
  );
};

const getEstadoPartidoTexto = (codestado: number): string => {
  const estados: Record<number, string> = {
    10: "No Comenzado",
    20: "Iniciado",
    21: "Primer Tiempo",
    22: "Segundo Tiempo",
    23: "Primer Suplementario",
    24: "Segundo Suplementario",
    25: "Penales",
    30: "Entretiempo",
    40: "Finalizado",
    50: "Suspendido",
    60: "Demorado",
    70: "No Computa",
  };
  return estados[codestado] || "Desconocido";
};

const getEstadoPartidoColor = (
  codestado: number
): "green" | "yellow" | "gray" | "blue" | "red" | "indigo" => {
  if (codestado === 40) return "green";
  if (codestado >= 20 && codestado < 40) return "blue";
  if (codestado === 50) return "red";
  if (codestado === 10) return "gray";
  return "yellow";
};

const InfoCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
    <div className="text-blue-600">{icon}</div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const Section: React.FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  color?: string;
}> = ({ title, icon, children, color = "blue" }) => (
  <div className="mb-6">
    <div
      className={`flex items-center gap-2 mb-3 pb-2 border-b-2 border-${color}-500`}
    >
      {icon && <span className={`text-${color}-600`}>{icon}</span>}
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
    </div>
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {children}
    </div>
  </div>
);

const Table: React.FC<{ headers: string[]; children: React.ReactNode }> = ({
  headers,
  children,
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
        <tr>
          {headers.map((h, idx) => (
            <th
              key={idx}
              className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">{children}</tbody>
    </table>
  </div>
);

const PlanillaDetalle: React.FC<Props> = ({ planillaCompleta, onClose }) => {
  const {
    planilla,
    equipos,
    arbitros,
    canchas,
    profesores,
    medico,
    otros_gastos,
    totales,
  } = planillaCompleta;

  const estado = planilla.fhcierrecaja
    ? "Contabilizada"
    : planilla.fhcierre
    ? "Cerrada"
    : "Abierta";

  const estadoColor: "green" | "yellow" | "gray" = planilla.fhcierrecaja
    ? "green"
    : planilla.fhcierre
    ? "yellow"
    : "gray";

  const partidoInfo = planilla.partido_info;

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-2">
      {/* Header con gradiente */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 shadow-lg z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <TrophyIcon className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Planilla de Pago</h2>
                <p className="text-blue-100 text-sm">
                  Detalle completo de ingresos y egresos
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge text={estado} color={estadoColor} />
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-md"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Información General - Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard
          icon={<CalendarIcon className="h-5 w-5" />}
          label="Fecha"
          value={
            planilla.fecha
              ? new Date(planilla.fecha).toLocaleDateString("es-AR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "-"
          }
        />
        <InfoCard
          icon={<MapPinIcon className="h-5 w-5" />}
          label="Sede"
          value={planilla.sede_nombre ?? "Sin especificar"}
        />
        <InfoCard
          icon={<TrophyIcon className="h-5 w-5" />}
          label="Torneo · Zona"
          value={`${planilla.torneo_nombre || planilla.torneo || "-"} ${
            planilla.zona ? `· ${planilla.zona}` : ""
          }`}
        />
      </div>

      {/* Información del Partido - Mejorado */}
      {partidoInfo && (
        <Section
          title="Información del Partido"
          icon={<UsersIcon className="h-6 w-6" />}
          color="indigo"
        >
          <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              {/* Equipo Local */}
              <div className="text-center flex-1">
                <div className="mb-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-lg mb-2">
                    L
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-800 mb-2">
                  {partidoInfo.nombre1 || "Equipo Local"}
                </div>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg border-4 border-blue-500">
                  <span className="text-4xl font-black text-blue-600">
                    {partidoInfo.goles1 ?? 0}
                  </span>
                </div>
              </div>

              {/* Separador central */}
              <div className="px-8 flex flex-col items-center gap-3">
                <div className="text-3xl font-black text-gray-400">VS</div>
                {partidoInfo.codestado !== undefined && (
                  <Badge
                    text={getEstadoPartidoTexto(partidoInfo.codestado)}
                    color={getEstadoPartidoColor(partidoInfo.codestado)}
                  />
                )}
                {partidoInfo.arbitro && (
                  <div className="text-xs text-gray-600 text-center">
                    <span className="font-semibold">Árbitro:</span>
                    <br />
                    {partidoInfo.arbitro}
                  </div>
                )}
              </div>

              {/* Equipo Visitante */}
              <div className="text-center flex-1">
                <div className="mb-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold text-lg mb-2">
                    V
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-800 mb-2">
                  {partidoInfo.nombre2 || "Equipo Visitante"}
                </div>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg border-4 border-indigo-500">
                  <span className="text-4xl font-black text-indigo-600">
                    {partidoInfo.goles2 ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Observaciones */}
      {(planilla.observ || planilla.observ_caja) && (
        <Section title="Observaciones" icon={<ClockIcon className="h-5 w-5" />}>
          <div className="p-4 space-y-3">
            {planilla.observ && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-xs font-semibold text-blue-600 mb-1">
                    Planilla
                  </p>
                  <p className="text-sm text-gray-700">{planilla.observ}</p>
                </div>
              </div>
            )}
            {planilla.observ_caja && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-xs font-semibold text-green-600 mb-1">
                    Caja
                  </p>
                  <p className="text-sm text-gray-700">
                    {planilla.observ_caja}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Ingresos - Equipos */}
      {equipos?.length > 0 && (
        <Section
          title="💰 Ingresos por Equipos"
          icon={<CurrencyDollarIcon className="h-5 w-5" />}
          color="green"
        >
          <Table
            headers={["Orden", "Equipo", "Tipo Pago", "Depósito", "Importe"]}
          >
            {equipos.map((e, index) => {
              let nombreEquipo = e.nombre_equipo;
              if (partidoInfo) {
                if (index === 0 && partidoInfo.nombre1) {
                  nombreEquipo = partidoInfo.nombre1;
                } else if (index === 1 && partidoInfo.nombre2) {
                  nombreEquipo = partidoInfo.nombre2;
                }
              }

              return (
                <tr
                  key={`eq-${e.idfecha}-${e.orden}`}
                  className="hover:bg-green-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-xs">
                      {e.orden}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {nombreEquipo || e.idequipo}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      text={
                        e.tipopago === 1
                          ? "Efectivo"
                          : e.tipopago === 2
                          ? "Transferencia"
                          : e.tipopago === 3
                          ? "Déb. Automático"
                          : "Otro"
                      }
                      color={
                        e.tipopago === 1
                          ? "green"
                          : e.tipopago === 2
                          ? "blue"
                          : "yellow"
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {e.iddeposito ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-700">
                    {currency(e.importe)}
                  </td>
                </tr>
              );
            })}
          </Table>
        </Section>
      )}

      {/* Egresos - Árbitros */}
      {arbitros?.length > 0 && (
        <Section title="👨‍⚖️ Egresos · Árbitros" color="red">
          <Table
            headers={["Orden", "Árbitro", "Partidos", "Valor/Partido", "Total"]}
          >
            {arbitros.map((a) => (
              <tr
                key={`ar-${a.idfecha}-${a.orden}`}
                className="hover:bg-red-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                    {a.orden}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {a.nombre_arbitro ?? `ID: ${a.idarbitro}`}
                </td>
                <td className="px-4 py-3 text-center">{a.partidos}</td>
                <td className="px-4 py-3 text-right">
                  {currency(a.valor_partido)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-700">
                  {currency(a.total)}
                </td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {/* Egresos - Canchas */}
      {canchas?.length > 0 && (
        <Section title="🏟️ Egresos · Canchas" color="red">
          <Table headers={["Orden", "Horas", "Valor/Hora", "Total"]}>
            {canchas.map((c) => (
              <tr
                key={`ca-${c.idfecha}-${c.orden}`}
                className="hover:bg-red-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                    {c.orden}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">{c.horas}</td>
                <td className="px-4 py-3 text-right">
                  {currency(c.valor_hora)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-700">
                  {currency(c.total)}
                </td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {/* Egresos - Profesores */}
      {profesores?.length > 0 && (
        <Section title="👨‍🏫 Egresos · Profesores" color="red">
          <Table
            headers={["Orden", "Profesor", "Horas", "Valor/Hora", "Total"]}
          >
            {profesores.map((p) => (
              <tr
                key={`pr-${p.idfecha}-${p.orden}`}
                className="hover:bg-red-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                    {p.orden}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {p.nombre_profesor ?? `ID: ${p.idprofesor}`}
                </td>
                <td className="px-4 py-3 text-center">{p.horas}</td>
                <td className="px-4 py-3 text-right">
                  {currency(p.valor_hora)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-700">
                  {currency(p.total)}
                </td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {/* Egresos - Médico */}
      {medico?.length > 0 && (
        <Section title="⚕️ Egresos · Servicio Médico" color="red">
          <Table headers={["Orden", "Médico", "Horas", "Valor/Hora", "Total"]}>
            {medico.map((m) => (
              <tr
                key={`me-${m.idfecha}-${m.orden}`}
                className="hover:bg-red-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                    {m.orden}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {m.nombre_medico ?? `ID: ${m.idmedico}`}
                </td>
                <td className="px-4 py-3 text-center">{m.horas}</td>
                <td className="px-4 py-3 text-right">
                  {currency(m.valor_hora)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-700">
                  {currency(m.total)}
                </td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {/* Egresos - Otros gastos */}
      {otros_gastos?.length > 0 && (
        <Section title="📦 Egresos · Otros Gastos" color="red">
          <Table
            headers={["Orden", "Gasto", "Cantidad", "Valor/Unidad", "Total"]}
          >
            {otros_gastos.map((g) => (
              <tr
                key={`og-${g.idfecha}-${g.orden}`}
                className="hover:bg-red-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                    {g.orden}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {g.descripcion_gasto ?? `Código: ${g.codgasto}`}
                </td>
                <td className="px-4 py-3 text-center">{g.cantidad}</td>
                <td className="px-4 py-3 text-right">
                  {currency(g.valor_unidad)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-700">
                  {currency(g.total)}
                </td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {/* Totales - Mejorado */}
      <Section
        title="Resumen Financiero"
        icon={<CurrencyDollarIcon className="h-6 w-6" />}
        color="purple"
      >
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Ingresos */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-lg border-2 border-green-200">
              <h4 className="text-sm font-bold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                INGRESOS
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Inscripciones</span>
                  <span className="font-semibold text-green-700">
                    {currency(totales?.ingreso_inscripciones)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Depósitos</span>
                  <span className="font-semibold text-green-700">
                    {currency(totales?.ingreso_depositos)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Fecha</span>
                  <span className="font-semibold text-green-700">
                    {currency(totales?.ingreso_fecha)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-green-300">
                  <span className="text-sm font-bold text-green-900">
                    TOTAL INGRESOS
                  </span>
                  <span className="text-lg font-black text-green-700">
                    {currency(totales?.total_ingresos)}
                  </span>
                </div>
              </div>
            </div>

            {/* Egresos */}
            <div className="bg-gradient-to-br from-red-50 to-rose-50 p-5 rounded-lg border-2 border-red-200">
              <h4 className="text-sm font-bold text-red-800 mb-4 flex items-center gap-2">
                <XCircleIcon className="h-5 w-5" />
                EGRESOS
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Árbitros</span>
                  <span className="font-semibold text-red-700">
                    {currency(totales?.egreso_arbitros)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Canchas</span>
                  <span className="font-semibold text-red-700">
                    {currency(totales?.egreso_canchas)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Profesores</span>
                  <span className="font-semibold text-red-700">
                    {currency(totales?.egreso_profesores)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Médico</span>
                  <span className="font-semibold text-red-700">
                    {currency(totales?.egreso_medico)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Otros</span>
                  <span className="font-semibold text-red-700">
                    {currency(totales?.egreso_otros)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-red-300">
                  <span className="text-sm font-bold text-red-900">
                    TOTAL EGRESOS
                  </span>
                  <span className="text-lg font-black text-red-700">
                    {currency(totales?.total_egresos)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resultados Finales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-xl shadow-md border-2 border-blue-300">
              <div className="text-xs font-semibold text-blue-700 mb-2">
                TOTAL CAJA
              </div>
              <div className="text-3xl font-black text-blue-700">
                {currency(totales?.total_caja)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-xl shadow-md border-2 border-green-300">
              <div className="text-xs font-semibold text-green-700 mb-2">
                TOTAL EFECTIVO
              </div>
              <div className="text-3xl font-black text-green-700">
                {currency(totales?.total_efectivo)}
              </div>
            </div>

            <div
              className={`p-6 rounded-xl shadow-md border-2 ${
                (totales?.diferencia_caja ?? 0) === 0
                  ? "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300"
                  : (totales?.diferencia_caja ?? 0) > 0
                  ? "bg-gradient-to-br from-green-100 to-green-200 border-green-300"
                  : "bg-gradient-to-br from-red-100 to-red-200 border-red-300"
              }`}
            >
              <div
                className={`text-xs font-semibold mb-2 ${
                  (totales?.diferencia_caja ?? 0) === 0
                    ? "text-gray-700"
                    : (totales?.diferencia_caja ?? 0) > 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                DIFERENCIA CAJA
              </div>
              <div
                className={`text-3xl font-black ${
                  (totales?.diferencia_caja ?? 0) === 0
                    ? "text-gray-700"
                    : (totales?.diferencia_caja ?? 0) > 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {currency(totales?.diferencia_caja)}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer actions */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-white pt-4 border-t-2 border-gray-200">
        <button
          onClick={onClose}
          className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default PlanillaDetalle;
