import React, { useState, useEffect, useCallback } from "react";
import API from "../../../api/httpClient";

interface PlanillaEquipo {
  idfecha: number;
  orden: number;
  idequipo: number;
  nombre_equipo: string;
  ausente?: boolean;
  tipopago?: number;
  importe?: number;
  iddeposito?: number;
  // Campos de deudas (pueden venir del backend o calcularse)
  deuda_inscripcion?: number;
  deuda_deposito?: number;
  deuda_fecha?: number;
  total_a_pagar?: number;
  pago_inscripcion?: number;
  pago_deposito?: number;
  pago_fecha?: number;
  deuda_total?: number;
}

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

  // Estado del formulario
  const [formData, setFormData] = useState({
    idequipo: 0,
    tipopago: 0,
    importe: 0,
  });

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

  const handleGrabarClick = async () => {
    if (formData.idequipo === 0) {
      alert("Debe seleccionar un equipo");
      return;
    }

    if (formData.tipopago === 0) {
      alert("Debe seleccionar un tipo de pago");
      return;
    }

    if (formData.importe <= 0) {
      alert("Debe ingresar un importe válido");
      return;
    }

    try {
      // Usar el endpoint existente de actualización de equipo
      const equipo = equipos.find((e) => e.idequipo === formData.idequipo);
      if (!equipo) return;

      await API.put(`/api/planillas-pago/${idfecha}/equipos/${equipo.orden}`, {
        tipopago: formData.tipopago,
        importe: formData.importe,
      });

      // Resetear formulario
      setFormData({
        idequipo: 0,
        tipopago: 0,
        importe: 0,
      });

      await fetchEquipos();
      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al registrar pago";
      onError?.(errorMessage);
      console.error("Error al registrar pago:", err);
    }
  };

  const currency = (n: number = 0) => `$ ${n.toLocaleString("es-AR")}`;

  // Calcular totales
  const calcularTotales = () => {
    return equipos.reduce(
      (acc, equipo) => ({
        deuda_inscripcion:
          acc.deuda_inscripcion + (equipo.deuda_inscripcion || 0),
        deuda_deposito: acc.deuda_deposito + (equipo.deuda_deposito || 0),
        deuda_fecha: acc.deuda_fecha + (equipo.deuda_fecha || 0),
        total_a_pagar: acc.total_a_pagar + (equipo.total_a_pagar || 0),
        pago_inscripcion: acc.pago_inscripcion + (equipo.pago_inscripcion || 0),
        pago_deposito: acc.pago_deposito + (equipo.pago_deposito || 0),
        pago_fecha: acc.pago_fecha + (equipo.pago_fecha || 0),
        deuda_total: acc.deuda_total + (equipo.deuda_total || 0),
      }),
      {
        deuda_inscripcion: 0,
        deuda_deposito: 0,
        deuda_fecha: 0,
        total_a_pagar: 0,
        pago_inscripcion: 0,
        pago_deposito: 0,
        pago_fecha: 0,
        deuda_total: 0,
      }
    );
  };

  const totales = calcularTotales();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Cargando equipos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold">Ingresos por Equipos</h3>

      {/* FORMULARIO DE PAGO */}
      <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
        <div className="flex gap-4">
          {/* Columna de Labels */}
          <div className="flex flex-col gap-4 w-[30%]">
            <label className="font-bold text-gray-700 h-10 flex items-center">
              Equipo
            </label>
            <label className="font-bold text-gray-700 h-10 flex items-center">
              Tipo Pago
            </label>
            <label className="font-bold text-gray-700 h-10 flex items-center">
              Importe
            </label>
          </div>

          {/* Columna de Inputs */}
          <div className="flex flex-col gap-4 w-[70%]">
            <select
              value={formData.idequipo}
              onChange={(e) =>
                setFormData({ ...formData, idequipo: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              disabled={!isEditable}
            >
              <option value={0}>Seleccionar</option>
              {equipos.map((equipo) => (
                <option key={equipo.idequipo} value={equipo.idequipo}>
                  {equipo.nombre_equipo}
                </option>
              ))}
            </select>

            <select
              value={formData.tipopago}
              onChange={(e) =>
                setFormData({ ...formData, tipopago: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              disabled={!isEditable}
            >
              <option value={0}>Seleccionar</option>
              <option value={1}>Inscripción (Efectivo)</option>
              <option value={2}>Depósito (Transferencia)</option>
              <option value={3}>Fecha (Débito)</option>
            </select>

            <input
              type="number"
              value={formData.importe}
              onChange={(e) =>
                setFormData({ ...formData, importe: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              disabled={!isEditable}
              placeholder="0"
              min="0"
              step="1"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleGrabarClick}
            disabled={!isEditable}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Grabar
          </button>
        </div>
      </div>

      {/* TABLA DE EQUIPOS CON DEUDAS */}
      {equipos.length === 0 ? (
        <div className="border rounded-lg p-8 text-center bg-yellow-50">
          <div className="text-yellow-800 font-medium mb-2">
            ⚠️ No hay equipos registrados
          </div>
          <div className="text-sm text-yellow-700">
            Los equipos aparecerán aquí cuando estén registrados en esta fecha.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-gray-300 rounded-lg shadow-sm">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-2 text-center font-bold border-2 border-gray-300 w-12">
                  Aus.
                </th>
                <th className="px-3 py-2 text-center font-bold border-2 border-gray-300 min-w-[150px]">
                  Equipo
                </th>
                <th className="px-2 py-2 text-center font-bold border-2 border-gray-300">
                  Deuda Inscrip.
                </th>
                <th className="px-2 py-2 text-center font-bold border-2 border-gray-300">
                  Deuda Depósito
                </th>
                <th className="px-2 py-2 text-center font-bold border-2 border-gray-300">
                  Deuda Fecha
                </th>
                <th className="px-2 py-2 text-center font-bold border-2 border-gray-300 bg-red-100">
                  Total a Pagar
                </th>
                <th className="px-2 py-2 text-center font-bold border-2 border-gray-300">
                  Pago Inscrip.
                </th>
                <th className="px-2 py-2 text-center font-bold border-2 border-gray-300">
                  Pago Depósito
                </th>
                <th className="px-2 py-2 text-center font-bold border-2 border-gray-300">
                  Pago Fecha
                </th>
                <th className="px-2 py-2 text-center font-bold border-2 border-gray-300 bg-red-100">
                  Deuda Total
                </th>
              </tr>
            </thead>
            <tbody>
              {equipos.map((equipo, index) => (
                <tr
                  key={index}
                  className={`border-b-2 border-gray-300 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="px-2 py-2 text-center border border-gray-300">
                    <input
                      type="checkbox"
                      checked={equipo.ausente || false}
                      disabled
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="px-3 py-2 text-left border border-gray-300 font-medium">
                    {equipo.nombre_equipo}
                  </td>
                  <td className="px-2 py-2 text-right border border-gray-300">
                    {currency(equipo.deuda_inscripcion)}
                  </td>
                  <td className="px-2 py-2 text-right border border-gray-300">
                    {currency(equipo.deuda_deposito)}
                  </td>
                  <td className="px-2 py-2 text-right border border-gray-300">
                    {currency(equipo.deuda_fecha)}
                  </td>
                  <td className="px-2 py-2 text-right border border-gray-300 bg-red-50 font-semibold">
                    {currency(equipo.total_a_pagar)}
                  </td>
                  <td className="px-2 py-2 text-right border border-gray-300 text-green-700">
                    {currency(equipo.pago_inscripcion)}
                  </td>
                  <td className="px-2 py-2 text-right border border-gray-300 text-green-700">
                    {currency(equipo.pago_deposito)}
                  </td>
                  <td className="px-2 py-2 text-right border border-gray-300 text-green-700">
                    {currency(equipo.pago_fecha)}
                  </td>
                  <td className="px-2 py-2 text-right border border-gray-300 bg-red-50 font-bold text-red-700">
                    {currency(equipo.deuda_total)}
                  </td>
                </tr>
              ))}

              {/* Fila TOTAL */}
              <tr className="bg-gray-200 font-bold">
                <td
                  colSpan={2}
                  className="px-3 py-2 text-center border-2 border-gray-300"
                >
                  TOTAL
                </td>
                <td className="px-2 py-2 text-right border-2 border-gray-300">
                  {currency(totales.deuda_inscripcion)}
                </td>
                <td className="px-2 py-2 text-right border-2 border-gray-300">
                  {currency(totales.deuda_deposito)}
                </td>
                <td className="px-2 py-2 text-right border-2 border-gray-300">
                  {currency(totales.deuda_fecha)}
                </td>
                <td className="px-2 py-2 text-right border-2 border-gray-300 bg-red-100">
                  {currency(totales.total_a_pagar)}
                </td>
                <td className="px-2 py-2 text-right border-2 border-gray-300 text-green-700">
                  {currency(totales.pago_inscripcion)}
                </td>
                <td className="px-2 py-2 text-right border-2 border-gray-300 text-green-700">
                  {currency(totales.pago_deposito)}
                </td>
                <td className="px-2 py-2 text-right border-2 border-gray-300 text-green-700">
                  {currency(totales.pago_fecha)}
                </td>
                <td className="px-2 py-2 text-right border-2 border-gray-300 bg-red-100">
                  {currency(totales.deuda_total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
