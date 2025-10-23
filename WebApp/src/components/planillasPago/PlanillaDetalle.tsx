// Ubicación: WebApp/src/components/planillasPago/PlanillaDetalle.tsx

import React from "react";
import { PlanillaCompleta } from "../../types/planillasPago";

type Props = {
  planillaCompleta: PlanillaCompleta;
  onClose: () => void;
};

const currency = (n: number | undefined | null) =>
  typeof n === "number"
    ? n.toLocaleString("es-AR", { style: "currency", currency: "ARS" })
    : "-";

const badge = (text: string, color: "green" | "yellow" | "gray" = "gray") => {
  const map: Record<string, string> = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    gray: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-medium ${map[color]}`}
    >
      {text}
    </span>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
    <div className="border border-gray-200 rounded-lg overflow-hidden">
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
      <thead className="bg-gray-50">
        <tr>
          {headers.map((h) => (
            <th key={h} className="px-3 py-2 text-left text-gray-600">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
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
  const estadoColor = planilla.fhcierrecaja
    ? "green"
    : planilla.fhcierre
    ? "yellow"
    : "gray";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Detalle de Planilla
          </h2>
          <p className="text-sm text-gray-500">
            Fecha:{" "}
            <strong>
              {planilla.fecha
                ? new Date(planilla.fecha).toLocaleDateString("es-AR")
                : "-"}
            </strong>{" "}
            · Sede: <strong>{planilla.sede_nombre ?? "-"}</strong> · Torneo:{" "}
            <strong>{planilla.torneo_nombre ?? "-"}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {badge(estado, estadoColor as "green" | "yellow" | "gray")}
          <button
            onClick={onClose}
            className="inline-flex items-center px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Observaciones */}
      {(planilla.observ || planilla.observ_caja) && (
        <Section title="Observaciones">
          <div className="p-3 text-sm text-gray-700 space-y-1">
            {planilla.observ && (
              <p>
                <span className="font-medium text-gray-600">Planilla:</span>{" "}
                {planilla.observ}
              </p>
            )}
            {planilla.observ_caja && (
              <p>
                <span className="font-medium text-gray-600">Caja:</span>{" "}
                {planilla.observ_caja}
              </p>
            )}
          </div>
        </Section>
      )}

      {/* Ingresos - Equipos */}
      {equipos?.length > 0 && (
        <Section title="Ingresos · Equipos">
          <Table
            headers={["Orden", "Equipo", "Tipo pago", "Depósito", "Importe"]}
          >
            {equipos.map((e) => (
              <tr key={`eq-${e.idfecha}-${e.orden}`} className="border-t">
                <td className="px-3 py-2">{e.orden}</td>
                <td className="px-3 py-2">{e.nombre_equipo ?? e.idequipo}</td>
                <td className="px-3 py-2">{e.tipopago}</td>
                <td className="px-3 py-2">{e.iddeposito ?? "-"}</td>
                <td className="px-3 py-2 text-right font-medium">
                  {currency(e.importe)}
                </td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {/* Egresos - Árbitros */}
      {arbitros?.length > 0 && (
        <Section title="Egresos · Árbitros">
          <Table
            headers={["Orden", "Árbitro", "Partidos", "Valor partido", "Total"]}
          >
            {arbitros.map((a) => (
              <tr key={`ar-${a.idfecha}-${a.orden}`} className="border-t">
                <td className="px-3 py-2">{a.orden}</td>
                <td className="px-3 py-2">{a.nombre_arbitro ?? a.idarbitro}</td>
                <td className="px-3 py-2">{a.partidos}</td>
                <td className="px-3 py-2 text-right">
                  {currency(a.valor_partido)}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {currency(a.total)}
                </td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {/* Egresos - Canchas */}
      {canchas?.length > 0 && (
        <Section title="Egresos · Canchas">
          <Table headers={["Orden", "Horas", "Valor hora", "Total"]}>
            {canchas.map((c) => (
              <tr key={`ca-${c.idfecha}-${c.orden}`} className="border-t">
                <td className="px-3 py-2">{c.orden}</td>
                <td className="px-3 py-2">{c.horas}</td>
                <td className="px-3 py-2 text-right">
                  {currency(c.valor_hora)}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {currency(c.total)}
                </td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {/* Egresos - Profesores */}
      {profesores?.length > 0 && (
        <Section title="Egresos · Profesores">
          <Table
            headers={["Orden", "Profesor", "Horas", "Valor hora", "Total"]}
          >
            {profesores.map((p) => (
              <tr key={`pr-${p.idfecha}-${p.orden}`} className="border-t">
                <td className="px-3 py-2">{p.orden}</td>
                <td className="px-3 py-2">
                  {p.nombre_profesor ?? p.idprofesor}
                </td>
                <td className="px-3 py-2">{p.horas}</td>
                <td className="px-3 py-2 text-right">
                  {currency(p.valor_hora)}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {currency(p.total)}
                </td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {/* Egresos - Médico */}
      {medico?.length > 0 && (
        <Section title="Egresos · Médico">
          <Table headers={["Orden", "Médico", "Horas", "Valor hora", "Total"]}>
            {medico.map((m) => (
              <tr key={`me-${m.idfecha}-${m.orden}`} className="border-t">
                <td className="px-3 py-2">{m.orden}</td>
                <td className="px-3 py-2">{m.nombre_medico ?? m.idmedico}</td>
                <td className="px-3 py-2">{m.horas}</td>
                <td className="px-3 py-2 text-right">
                  {currency(m.valor_hora)}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {currency(m.total)}
                </td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {/* Egresos - Otros gastos */}
      {otros_gastos?.length > 0 && (
        <Section title="Egresos · Otros gastos">
          <Table
            headers={["Orden", "Gasto", "Cantidad", "Valor unidad", "Total"]}
          >
            {otros_gastos.map((g) => (
              <tr key={`og-${g.idfecha}-${g.orden}`} className="border-t">
                <td className="px-3 py-2">{g.orden}</td>
                <td className="px-3 py-2">
                  {g.descripcion_gasto ?? g.codgasto}
                </td>
                <td className="px-3 py-2">{g.cantidad}</td>
                <td className="px-3 py-2 text-right">
                  {currency(g.valor_unidad)}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {currency(g.total)}
                </td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      {/* Totales */}
      <Section title="Totales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="p-3 border-r border-gray-200">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">
              Ingresos
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex justify-between">
                <span>Inscripciones</span>
                <span className="font-medium">
                  {currency(totales?.ingreso_inscripciones)}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Depósitos</span>
                <span className="font-medium">
                  {currency(totales?.ingreso_depositos)}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Total ingresos</span>
                <span className="font-semibold">
                  {currency(totales?.total_ingresos)}
                </span>
              </li>
            </ul>
          </div>
          <div className="p-3">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">
              Egresos
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex justify-between">
                <span>Árbitros</span>
                <span className="font-medium">
                  {currency(totales?.egreso_arbitros)}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Canchas</span>
                <span className="font-medium">
                  {currency(totales?.egreso_canchas)}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Profesores</span>
                <span className="font-medium">
                  {currency(totales?.egreso_profesores)}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Médico</span>
                <span className="font-medium">
                  {currency(totales?.egreso_medico)}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Otros</span>
                <span className="font-medium">
                  {currency(totales?.egreso_otros)}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Total egresos</span>
                <span className="font-semibold">
                  {currency(totales?.total_egresos)}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="p-3 border-t border-gray-200 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total caja</span>
            <span className="text-sm font-semibold">
              {currency(totales?.total_caja)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total efectivo</span>
            <span className="text-sm font-semibold">
              {currency(totales?.total_efectivo)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Diferencia caja</span>
            <span
              className={`text-sm font-semibold ${
                (totales?.diferencia_caja ?? 0) === 0
                  ? "text-gray-700"
                  : (totales?.diferencia_caja ?? 0) > 0
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {currency(totales?.diferencia_caja)}
            </span>
          </div>
        </div>
      </Section>

      {/* Footer actions */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default PlanillaDetalle;
