// WebApp/src/components/planillasPago/tabs/TotalesTab.tsx

import React, { useState, useEffect } from "react";

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
  efectivo_real?: number;
  observ_caja?: string;
  onUpdateEfectivoReal: (efectivo: number) => void;
  onUpdateObservCaja: (observ: string) => void;
}

const currency = (n: number) => `$${Math.round(n).toLocaleString("es-AR")}`;

export const TotalesTab: React.FC<TotalesTabProps> = ({
  totales,
  efectivo_real = 0,
  observ_caja,
  onUpdateEfectivoReal,
  onUpdateObservCaja,
}) => {
  const [efectivoInput, setEfectivoInput] = useState(
    efectivo_real?.toString() || "0"
  );

  // Sincronizar efectivoInput cuando el prop cambia (ej. al refrescar datos)
  useEffect(() => {
    setEfectivoInput(efectivo_real?.toString() || "0");
  }, [efectivo_real]);

  // Diferencia = Total Caja - Efectivo Real (lo que se contó físicamente)
  const diferencia_final = totales.total_caja - (parseFloat(efectivoInput) || 0);

  const handleEfectivoChange = (value: string) => {
    setEfectivoInput(value);
    const numValue = parseFloat(value) || 0;
    onUpdateEfectivoReal(numValue);
  };
  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold">Resumen Financiero</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ingresos */}
        <div className="border-2 rounded-xl p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-green-200">
            <span className="text-xl">💰</span>
            <h4 className="text-sm font-bold text-green-800">INGRESOS</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Inscripciones</span>
              <span className="font-bold text-green-700 text-sm tabular-nums">
                {currency(totales.ingreso_inscripciones)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Depósitos</span>
              <span className="font-bold text-green-700 text-sm tabular-nums">
                {currency(totales.ingreso_depositos)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Pagos Fecha</span>
              <span className="font-bold text-green-700 text-sm tabular-nums">
                {currency(totales.ingreso_fecha)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-green-300">
              <span className="text-xs font-bold text-green-800">TOTAL</span>
              <span className="font-black text-green-800 text-base tabular-nums">
                {currency(totales.total_ingresos)}
              </span>
            </div>
          </div>
        </div>

        {/* Egresos */}
        <div className="border-2 rounded-xl p-4 bg-gradient-to-br from-red-50 to-rose-50 border-red-300 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-red-200">
            <span className="text-xl">💸</span>
            <h4 className="text-sm font-bold text-red-800">EGRESOS</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Árbitros</span>
              <span className="font-bold text-red-700 text-sm tabular-nums">
                {currency(totales.egreso_arbitros)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Canchas</span>
              <span className="font-bold text-red-700 text-sm tabular-nums">
                {currency(totales.egreso_canchas)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Profesores</span>
              <span className="font-bold text-red-700 text-sm tabular-nums">
                {currency(totales.egreso_profesores)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Serv. Médico</span>
              <span className="font-bold text-red-700 text-sm tabular-nums">
                {currency(totales.egreso_medico)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Otros Gastos</span>
              <span className="font-bold text-red-700 text-sm tabular-nums">
                {currency(totales.egreso_otros)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-red-300">
              <span className="text-xs font-bold text-red-800">TOTAL</span>
              <span className="font-black text-red-800 text-base tabular-nums">
                {currency(totales.total_egresos)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados Finales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl shadow-sm border-2 border-blue-300">
          <div className="text-[10px] font-bold text-blue-700 mb-1">
            TOTAL CAJA
          </div>
          <div className="text-2xl font-black text-blue-800 tabular-nums">
            {currency(totales.total_caja)}
          </div>
          <div className="text-[9px] text-blue-600 mt-1">
            Ingresos - Egresos
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl shadow-sm border-2 border-green-300">
          <div className="text-[10px] font-bold text-green-700 mb-1">
            EFECTIVO REAL
          </div>
          <input
            type="number"
            value={efectivoInput}
            onChange={(e) => handleEfectivoChange(e.target.value)}
            className="w-full text-2xl font-black text-green-800 bg-transparent border-b-2 border-green-400 focus:border-green-600 focus:outline-none text-center tabular-nums"
            placeholder="0"
          />
          <div className="text-[9px] text-green-600 mt-1">
            Contar plata física
          </div>
        </div>

        <div
          className={`p-4 rounded-xl shadow-sm border-2 ${
            diferencia_final === 0
              ? "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400"
              : diferencia_final > 0
              ? "bg-gradient-to-br from-green-100 to-green-200 border-green-400"
              : "bg-gradient-to-br from-red-100 to-red-200 border-red-400"
          }`}
        >
          <div
            className={`text-[10px] font-bold mb-1 ${
              diferencia_final === 0
                ? "text-gray-700"
                : diferencia_final > 0
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            DIFERENCIA
          </div>
          <div
            className={`text-2xl font-black tabular-nums ${
              diferencia_final === 0
                ? "text-gray-800"
                : diferencia_final > 0
                ? "text-green-800"
                : "text-red-800"
            }`}
          >
            {currency(diferencia_final)}
          </div>
          <div
            className={`text-[9px] mt-1 font-semibold ${
              diferencia_final === 0
                ? "text-gray-600"
                : diferencia_final > 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            Total Caja - Efectivo Real
          </div>
        </div>
      </div>

      {/* Observación de Caja */}
      <div className="border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observación de Cierre de Caja
        </label>
        <textarea
          rows={4}
          value={observ_caja || ""}
          onChange={(e) => onUpdateObservCaja(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: EFECTIVO: Madrazo $2000, Tiburón $35.000..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Anotar el detalle del efectivo real por caja o cualquier observación relevante.
        </p>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-semibold text-blue-800 mb-2">
          ℹ️ Información
        </h5>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>
            • <strong>Total Caja:</strong> Total ingresos menos total egresos
          </li>
          <li>
            • <strong>Efectivo Real:</strong> Lo que realmente hay en la caja física (ingresar manualmente)
          </li>
          <li>
            • <strong>Diferencia:</strong> Total Caja - Efectivo Real (sobrante o faltante de caja)
          </li>
        </ul>
      </div>
    </div>
  );
};
