import React, { useState, useEffect, useCallback } from "react";
import {
  toggleAusenciaEquipo,
  updatePagoFechaEquipo,
  updatePagoInscripcionEquipo,
  updatePagoDepositoEquipo,
} from "../../../api/planillasPagosService";
import { PlanillaEquipo } from "../../../types/planillasPago";
import API from "../../../api/httpClient";

interface EquiposTabProps {
  idfecha: number;
  isEditable: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

type EditingField = "pago_ins" | "pago_dep" | "pago_fecha" | null;

export const EquiposTab: React.FC<EquiposTabProps> = ({
  idfecha,
  isEditable,
  onSuccess,
  onError,
}) => {
  const [equipos, setEquipos] = useState<PlanillaEquipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{
    idequipo: number;
    field: EditingField;
    value: string;
  } | null>(null);

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

  const handleStartEdit = (idequipo: number, field: EditingField, currentValue: number) => {
    if (!isEditable) return;
    setEditingCell({
      idequipo,
      field,
      value: currentValue.toString(),
    });
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const handleSaveEdit = async (equipo: PlanillaEquipo) => {
    if (!editingCell) return;

    try {
      const nuevoImporte = parseFloat(editingCell.value || "0");

      if (isNaN(nuevoImporte) || nuevoImporte < 0) {
        onError?.("El importe debe ser un número válido");
        return;
      }

      switch (editingCell.field) {
        case "pago_ins":
          await updatePagoInscripcionEquipo(equipo.idfecha, equipo.idequipo, nuevoImporte);
          setEquipos((prev) =>
            prev.map((e) =>
              e.idequipo === equipo.idequipo
                ? {
                    ...e,
                    pago_ins: nuevoImporte,
                    deuda_total: e.total_pagar - (nuevoImporte + e.pago_dep + e.pago_fecha),
                  }
                : e
            )
          );
          break;
        case "pago_dep":
          await updatePagoDepositoEquipo(equipo.idfecha, equipo.idequipo, nuevoImporte);
          setEquipos((prev) =>
            prev.map((e) =>
              e.idequipo === equipo.idequipo
                ? {
                    ...e,
                    pago_dep: nuevoImporte,
                    deuda_total: e.total_pagar - (e.pago_ins + nuevoImporte + e.pago_fecha),
                  }
                : e
            )
          );
          break;
        case "pago_fecha":
          await updatePagoFechaEquipo(equipo.idfecha, equipo.idequipo, nuevoImporte);
          setEquipos((prev) =>
            prev.map((e) =>
              e.idequipo === equipo.idequipo
                ? {
                    ...e,
                    pago_fecha: nuevoImporte,
                    deuda_total: e.total_pagar - (e.pago_ins + e.pago_dep + nuevoImporte),
                  }
                : e
            )
          );
          break;
      }

      setEditingCell(null);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al actualizar pago";
      onError?.(errorMessage);
    }
  };

  const formatMoney = (value: number) => {
    return `$${value.toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const renderEditableCell = (
    equipo: PlanillaEquipo,
    field: EditingField,
    currentValue: number
  ) => {
    const isEditing =
      editingCell?.idequipo === equipo.idequipo && editingCell?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={editingCell.value}
            onChange={(e) =>
              setEditingCell({ ...editingCell, value: e.target.value })
            }
            className="w-20 px-1 py-1 border rounded text-xs"
            autoFocus
            min="0"
            step="1"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit(equipo);
              if (e.key === "Escape") handleCancelEdit();
            }}
          />
          <button
            onClick={() => handleSaveEdit(equipo)}
            className="text-green-600 hover:text-green-800 text-xs font-bold"
            title="Guardar"
          >
            ✓
          </button>
          <button
            onClick={handleCancelEdit}
            className="text-red-600 hover:text-red-800 text-xs font-bold"
            title="Cancelar"
          >
            ✗
          </button>
        </div>
      );
    }

    return (
      <div
        onClick={() => handleStartEdit(equipo.idequipo, field, currentValue)}
        className={`cursor-pointer hover:bg-opacity-70 px-2 py-1 rounded ${
          isEditable ? "hover:ring-2 hover:ring-blue-400" : ""
        }`}
        title={isEditable ? "Click para editar" : ""}
      >
        {formatMoney(currentValue)}
      </div>
    );
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
            Gestiona ausencias y pagos. Click en los campos de pago (verde) para editar.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
        <table className="w-full text-xs">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
            <tr>
              <th className="px-2 py-2 text-center border-r-2 border-gray-300 w-12">Ord</th>
              <th className="px-2 py-2 text-center border-r-2 border-gray-300 w-12">AUS</th>
              <th className="px-3 py-2 text-left border-r-2 border-gray-300 min-w-[150px]">Equipo</th>

              <th className="px-2 py-2 text-right bg-red-50 border-r border-gray-300">
                Deuda<br/>Insc.
              </th>
              <th className="px-2 py-2 text-right bg-red-50 border-r border-gray-300">
                Deuda<br/>Dep.
              </th>
              <th className="px-2 py-2 text-right bg-red-50 border-r-2 border-gray-300">
                Deuda<br/>Fecha
              </th>

              <th className="px-2 py-2 text-right bg-blue-100 font-bold border-r-2 border-gray-300">
                Total a<br/>Pagar
              </th>

              <th className="px-2 py-2 text-right bg-green-100 border-r border-gray-300">
                Pago<br/>Insc. ✏️
              </th>
              <th className="px-2 py-2 text-right bg-green-100 border-r border-gray-300">
                Pago<br/>Dep. ✏️
              </th>
              <th className="px-2 py-2 text-right bg-green-100 border-r-2 border-gray-300">
                Pago<br/>Fecha ✏️
              </th>

              <th className="px-2 py-2 text-right bg-yellow-100 font-bold">
                Deuda<br/>Total
              </th>
            </tr>
          </thead>
          <tbody>
            {equipos.map((equipo, index) => {
              const isAusente = equipo.ausente === 1;

              return (
                <tr
                  key={equipo.idequipo}
                  className={`border-b-2 border-gray-300 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } ${isAusente ? "opacity-50 bg-gray-100" : ""}`}
                >
                  <td className="px-2 py-2 text-center border-r-2 border-gray-300 font-medium">
                    {equipo.orden}
                  </td>

                  <td className="px-2 py-2 text-center border-r-2 border-gray-300">
                    <input
                      type="checkbox"
                      checked={isAusente}
                      onChange={() => handleToggleAusencia(equipo)}
                      disabled={!isEditable}
                      className="w-4 h-4 cursor-pointer accent-red-500"
                      title={isAusente ? "Marcar como presente" : "Marcar como ausente"}
                    />
                  </td>

                  <td className="px-3 py-2 font-medium border-r-2 border-gray-300">
                    {equipo.nombre_equipo}
                    <span className="text-gray-400 text-[10px] ml-1">
                      ({equipo.cantidad_partidos}p)
                    </span>
                  </td>

                  <td className="px-2 py-2 text-right bg-red-50 border-r border-gray-300">
                    {equipo.deuda_insc > 0 ? (
                      <span className="text-red-600 font-medium">{formatMoney(equipo.deuda_insc)}</span>
                    ) : (
                      <span className="text-gray-400">$0</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right bg-red-50 border-r border-gray-300">
                    {equipo.deuda_dep > 0 ? (
                      <span className="text-red-600 font-medium">{formatMoney(equipo.deuda_dep)}</span>
                    ) : (
                      <span className="text-gray-400">$0</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right bg-red-50 border-r-2 border-gray-300">
                    <span className="text-red-600 font-medium">{formatMoney(equipo.deuda_fecha)}</span>
                  </td>

                  <td className="px-2 py-2 text-right bg-blue-100 font-bold border-r-2 border-gray-300">
                    {formatMoney(equipo.total_pagar)}
                  </td>

                  <td className="px-2 py-2 text-right bg-green-50 border-r border-gray-300">
                    {renderEditableCell(equipo, "pago_ins", equipo.pago_ins)}
                  </td>
                  <td className="px-2 py-2 text-right bg-green-50 border-r border-gray-300">
                    {renderEditableCell(equipo, "pago_dep", equipo.pago_dep)}
                  </td>
                  <td className="px-2 py-2 text-right bg-green-50 border-r-2 border-gray-300">
                    {renderEditableCell(equipo, "pago_fecha", equipo.pago_fecha)}
                  </td>

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

      <div className="border-t-2 pt-4 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
        <div className="font-semibold text-blue-800 mb-2">ℹ️ Información</div>
        <ul className="text-blue-700 space-y-1">
          <li>• <strong>AUS:</strong> Marca el equipo como ausente (no computa económicamente)</li>
          <li>• <strong>Deuda Insc:</strong> Valor pendiente de inscripción (0 si ya se pagó en fechas anteriores)</li>
          <li>• <strong>Deuda Dep:</strong> Saldo negativo de cuenta corriente (depósitos adeudados)</li>
          <li>• <strong>Deuda Fecha:</strong> Valor por fecha × cantidad de partidos</li>
          <li>• <strong>Campos verdes (✏️):</strong> Click para editar el pago</li>
          <li>• <strong>Deuda Total:</strong> Rojo si debe, verde si pagó de más</li>
        </ul>
      </div>
    </div>
  );
};