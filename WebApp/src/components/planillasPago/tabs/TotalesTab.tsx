// WebApp/src/components/planillasPago/tabs/TotalesTab.tsx

import React from "react";

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingresos */}
        <div className="border-2 rounded-lg p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <h4 className="text-sm font-bold text-green-700 mb-4 flex items-center gap-2">
            💰 INGRESOS
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Inscripciones (Efectivo)</span>
              <span className="font-semibold text-green-700">
                {currency(totales.ingreso_inscripciones)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Depósitos (Transferencias)</span>
              <span className="font-semibold text-green-700">
                {currency(totales.ingreso_depositos)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Fecha (Déb. Automático)</span>
              <span className="font-semibold text-green-700">
                {currency(totales.ingreso_fecha)}
              </span>
            </div>
            <div className="flex justify-between border-t-2 border-green-300 pt-3 font-semibold text-green-800">
              <span>TOTAL INGRESOS</span>
              <span className="text-lg">
                {currency(totales.total_ingresos)}
              </span>
            </div>
          </div>
        </div>

        {/* Egresos */}
        <div className="border-2 rounded-lg p-5 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <h4 className="text-sm font-bold text-red-700 mb-4 flex items-center gap-2">
            💸 EGRESOS
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Árbitros</span>
              <span className="font-semibold text-red-700">
                {currency(totales.egreso_arbitros)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Canchas</span>
              <span className="font-semibold text-red-700">
                {currency(totales.egreso_canchas)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Profesores</span>
              <span className="font-semibold text-red-700">
                {currency(totales.egreso_profesores)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Serv. Médico</span>
              <span className="font-semibold text-red-700">
                {currency(totales.egreso_medico)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Otros Gastos</span>
              <span className="font-semibold text-red-700">
                {currency(totales.egreso_otros)}
              </span>
            </div>
            <div className="flex justify-between border-t-2 border-red-300 pt-3 font-semibold text-red-800">
              <span>TOTAL EGRESOS</span>
              <span className="text-lg">{currency(totales.total_egresos)}</span>
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
            {currency(totales.total_caja)}
          </div>
          <div className="text-xs text-blue-600 mt-2">(Ingresos - Egresos)</div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-xl shadow-md border-2 border-green-300">
          <div className="text-xs font-semibold text-green-700 mb-2">
            TOTAL EFECTIVO
          </div>
          <div className="text-3xl font-black text-green-700">
            {currency(totales.total_efectivo)}
          </div>
          <div className="text-xs text-green-600 mt-2">
            (Solo efectivo en caja)
          </div>
        </div>

        <div
          className={`p-6 rounded-xl shadow-md border-2 ${
            totales.diferencia_caja === 0
              ? "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300"
              : totales.diferencia_caja > 0
              ? "bg-gradient-to-br from-green-100 to-green-200 border-green-300"
              : "bg-gradient-to-br from-red-100 to-red-200 border-red-300"
          }`}
        >
          <div
            className={`text-xs font-semibold mb-2 ${
              totales.diferencia_caja === 0
                ? "text-gray-700"
                : totales.diferencia_caja > 0
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            DIFERENCIA CAJA
          </div>
          <div
            className={`text-3xl font-black ${
              totales.diferencia_caja === 0
                ? "text-gray-700"
                : totales.diferencia_caja > 0
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {currency(totales.diferencia_caja)}
          </div>
          <div
            className={`text-xs mt-2 ${
              totales.diferencia_caja === 0
                ? "text-gray-600"
                : totales.diferencia_caja > 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {totales.diferencia_caja === 0
              ? "Caja cuadrada ✓"
              : totales.diferencia_caja > 0
              ? "Sobrante"
              : "Faltante"}
          </div>
        </div>
      </div>

      {/* Observación de Caja */}
      <div className="border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observación de Cierre de Caja
        </label>
        <textarea
          rows={3}
          value={observ_caja || ""}
          onChange={(e) => onUpdateObservCaja(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: 1 power, 2 transferencias pendientes..."
        />
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-semibold text-blue-800 mb-2">
          ℹ️ Información
        </h5>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>
            • <strong>Total Caja:</strong> Todos los ingresos menos todos los
            egresos
          </li>
          <li>
            • <strong>Total Efectivo:</strong> Solo ingresos en efectivo menos
            egresos
          </li>
          <li>
            • <strong>Diferencia:</strong> Diferencia entre Total Efectivo y
            Total Caja
          </li>
        </ul>
      </div>
    </div>
  );
};
