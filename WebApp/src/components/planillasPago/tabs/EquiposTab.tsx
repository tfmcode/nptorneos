// WebApp/src/components/planillasPago/tabs/EquiposTab.tsx
// ✅ VERSIÓN COMPLETAMENTE NUEVA

import React, { useState, useEffect, useCallback } from "react";
import {
  toggleAusenciaEquipo,
  updatePagoFechaEquipo,
} from "../../../api/planillasPagosService";
import { PlanillaEquipo } from "../../../types/planillasPago";
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
  const [editingPagoFecha, setEditingPagoFecha] = useState<{
    [key: number]: string;
  }>({});

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

  const handleToggleAusencia = async (equipo: PlanillaEquipo) => {
    try {
      const nuevoEstado = equipo.ausente === 0 ? true : false;
      await toggleAusenciaEquipo(equipo.idfecha, equipo.idequipo, nuevoEstado);

      // Actualizar localmente
      setEquipos((prev) =>
        prev.map((e) =>
          e.idequipo === equipo.idequipo
            ? { ...e, ausente: nuevoEstado ? 1 : 0 }
            : e
        )
      );

      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al actualizar ausencia";
      onError?.(errorMessage);
    }
  };

  const handlePagoFechaChange = (idequipo: number, value: string) => {
    setEditingPagoFecha((prev) => ({
      ...prev,
      [idequipo]: value,
    }));
  };

  const handleSavePagoFecha = async (equipo: PlanillaEquipo) => {
    try {
      const nuevoImporte = parseFloat(editingPagoFecha[equipo.idequipo] || "0");

      if (isNaN(nuevoImporte) || nuevoImporte < 0) {
        onError?.("El importe debe ser un número válido");
        return;
      }

      await updatePagoFechaEquipo(equipo.idfecha, equipo.idequipo, nuevoImporte);

      // Actualizar localmente
      setEquipos((prev) =>
        prev.map((e) =>
          e.idequipo === equipo.idequipo
            ? {
                ...e,
                pago_fecha: nuevoImporte,
                deuda_total:
                  e.total_pagar - (e.pago_ins + e.pago_dep + nuevoImporte),
              }
            : e
        )
      );

      // Limpiar edición
      setEditingPagoFecha((prev) => {
        const newState = { ...prev };
        delete newState[equipo.idequipo];
        return newState;
      });

      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al actualizar pago fecha";
      onError?.(errorMessage);
    }
  };

  const formatMoney = (value: number) => {
    return `$${value.toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Cargando equipos...</div>
      </div>
    );
  }

  if (equipos.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center bg-yellow-50">
        <div className="text-yellow-800 font-medium mb-2">
          ⚠️ No hay equipos registrados en esta caja
        </div>
        <div className="text-sm text-yellow-700">
          Los equipos se crean automáticamente al guardar los datos del partido
          con profesor, fecha y sede completos.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-md font-semibold">Estado Económico por Equipo</h3>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona ausencias y pagos de fecha. Los demás valores se calculan automáticamente.
          </p>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
        <table className="w-full text-xs">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
            <tr>
              <th className="px-2 py-2 text-center border-r-2 border-gray-300">Orden</th>
              <th className="px-2 py-2 text-center border-r-2 border-gray-300">AUS</th>
              <th className="px-3 py-2 text-left border-r-2 border-gray-300">Equipo</th>

              {/* DEUDAS */}
              <th className="px-2 py-2 text-right bg-red-50 border-r border-gray-300">
                Deuda<br/>Insc.
              </th>
              <th className="px-2 py-2 text-right bg-red-50 border-r border-gray-300">
                Deuda<br/>Dep.
              </th>
              <th className="px-2 py-2 text-right bg-red-50 border-r-2 border-gray-300">
                Deuda<br/>Fecha
              </th>

              {/* TOTAL A PAGAR */}
              <th className="px-2 py-2 text-right bg-blue-100 font-bold border-r-2 border-gray-300">
                Total a<br/>Pagar
              </th>

              {/* PAGOS */}
              <th className="px-2 py-2 text-right bg-green-50 border-r border-gray-300">
                Pago<br/>Insc.
              </th>
              <th className="px-2 py-2 text-right bg-green-50 border-r border-gray-300">
                Pago<br/>Dep.
              </th>
              <th className="px-2 py-2 text-right bg-green-50 border-r-2 border-gray-300">
                Pago<br/>Fecha ✏️
              </th>

              {/* DEUDA TOTAL */}
              <th className="px-2 py-2 text-right bg-yellow-100 font-bold">
                Deuda<br/>Total
              </th>
            </tr>
          </thead>
          <tbody>
            {equipos.map((equipo, index) => {
              const isAusente = equipo.ausente === 1;
              const isEditingThisRow = editingPagoFecha[equipo.idequipo] !== undefined;

              return (
                <tr
                  key={equipo.idequipo}
                  className={`border-b-2 border-gray-300 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } ${isAusente ? "opacity-50 bg-gray-100" : ""}`}
                >
                  {/* Orden */}
                  <td className="px-2 py-2 text-center border-r-2 border-gray-300">
                    {equipo.orden}
                  </td>

                  {/* Ausente */}
                  <td className="px-2 py-2 text-center border-r-2 border-gray-300">
                    <input
                      type="checkbox"
                      checked={isAusente}
                      onChange={() => handleToggleAusencia(equipo)}
                      disabled={!isEditable}
                      className="w-4 h-4 cursor-pointer"
                      title={isAusente ? "Marcar como presente" : "Marcar como ausente"}
                    />
                  </td>

                  {/* Equipo */}
                  <td className="px-3 py-2 font-medium border-r-2 border-gray-300">
                    {equipo.nombre_equipo}
                    <span className="text-gray-400 text-xs ml-2">
                      ({equipo.cantidad_partidos}p)
                    </span>
                  </td>

                  {/* DEUDAS */}
                  <td className="px-2 py-2 text-right bg-red-50 border-r border-gray-300">
                    {formatMoney(equipo.deuda_insc)}
                  </td>
                  <td className="px-2 py-2 text-right bg-red-50 border-r border-gray-300">
                    {formatMoney(equipo.deuda_dep)}
                  </td>
                  <td className="px-2 py-2 text-right bg-red-50 border-r-2 border-gray-300">
                    {formatMoney(equipo.deuda_fecha)}
                  </td>

                  {/* TOTAL A PAGAR */}
                  <td className="px-2 py-2 text-right bg-blue-100 font-bold border-r-2 border-gray-300">
                    {formatMoney(equipo.total_pagar)}
                  </td>

                  {/* PAGOS */}
                  <td className="px-2 py-2 text-right bg-green-50 border-r border-gray-300">
                    {formatMoney(equipo.pago_ins)}
                  </td>
                  <td className="px-2 py-2 text-right bg-green-50 border-r border-gray-300">
                    {formatMoney(equipo.pago_dep)}
                  </td>

                  {/* PAGO FECHA - EDITABLE */}
                  <td className="px-2 py-2 text-right bg-green-50 border-r-2 border-gray-300">
                    {isEditingThisRow ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editingPagoFecha[equipo.idequipo]}
                          onChange={(e) =>
                            handlePagoFechaChange(equipo.idequipo, e.target.value)
                          }
                          className="w-20 px-1 py-1 border rounded text-xs"
                          disabled={!isEditable}
                          min="0"
                          step="0.01"
                        />
                        <button
                          onClick={() => handleSavePagoFecha(equipo)}
                          disabled={!isEditable}
                          className="text-green-600 hover:text-green-800 text-xs"
                          title="Guardar"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingPagoFecha((prev) => {
                              const newState = { ...prev };
                              delete newState[equipo.idequipo];
                              return newState;
                            });
                          }}
                          className="text-red-600 hover:text-red-800 text-xs"
                          title="Cancelar"
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          if (isEditable) {
                            setEditingPagoFecha((prev) => ({
                              ...prev,
                              [equipo.idequipo]: equipo.pago_fecha.toString(),
                            }));
                          }
                        }}
                        className="cursor-pointer hover:bg-green-100 px-2 py-1 rounded"
                      >
                        {formatMoney(equipo.pago_fecha)}
                      </div>
                    )}
                  </td>

                  {/* DEUDA TOTAL */}
                  <td
                    className={`px-2 py-2 text-right font-bold ${
                      equipo.deuda_total > 0
                        ? "bg-red-100 text-red-700"
                        : equipo.deuda_total < 0
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {formatMoney(equipo.deuda_total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumen de totales */}
      <div className="border-t-2 pt-4 mt-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-gray-600">Total a Cobrar</div>
            <div className="text-xl font-bold text-blue-700">
              {formatMoney(
                equipos.reduce((sum, e) => sum + e.total_pagar, 0)
              )}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-gray-600">Total Pagado</div>
            <div className="text-xl font-bold text-green-700">
              {formatMoney(
                equipos.reduce(
                  (sum, e) => sum + e.pago_ins + e.pago_dep + e.pago_fecha,
                  0
                )
              )}
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-sm text-gray-600">Deuda Pendiente</div>
            <div className="text-xl font-bold text-red-700">
              {formatMoney(
                equipos.reduce((sum, e) => sum + Math.max(0, e.deuda_total), 0)
              )}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm text-gray-600">Equipos Ausentes</div>
            <div className="text-xl font-bold text-purple-700">
              {equipos.filter((e) => e.ausente === 1).length}
            </div>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
        <div className="font-semibold text-blue-800 mb-2">ℹ️ Información</div>
        <ul className="text-blue-700 space-y-1">
          <li>• <strong>AUS:</strong> Marca el equipo como ausente (no computa económicamente)</li>
          <li>• <strong>Deuda Insc:</strong> Valor de inscripción del torneo</li>
          <li>• <strong>Deuda Dep:</strong> Suma de depósitos registrados del equipo</li>
          <li>• <strong>Deuda Fecha:</strong> Valor por fecha × cantidad de partidos</li>
          <li>• <strong>Pago Fecha:</strong> Único campo editable (click para modificar)</li>
          <li>• <strong>Deuda Total:</strong> Rojo si debe, verde si pagó de más</li>
        </ul>
      </div>
    </div>
  );
};
