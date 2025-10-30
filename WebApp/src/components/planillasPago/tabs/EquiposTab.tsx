// WebApp/src/components/planillasPago/tabs/EquiposTab.tsx
// REEMPLAZAR TODO EL ARCHIVO

import React, { useState, useEffect, useCallback } from "react";
import API from "../../../api/httpClient";

interface EquipoConDeudas {
  idfecha: number;
  orden: number;
  idequipo: number;
  nombre_equipo: string;
  deuda_inscripcion: number;
  deuda_deposito: number;
  deuda_fecha: number;
  total_a_pagar: number;
  pago_inscripcion: number;
  pago_deposito: number;
  pago_fecha: number;
  deuda_total: number;
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
  const [equipos, setEquipos] = useState<EquipoConDeudas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState<EquipoConDeudas | null>(
    null
  );
  const [pagoForm, setPagoForm] = useState({
    tipopago: 1,
    importe: 0,
    iddeposito: 0,
  });

  // ✅ CORRECCIÓN: useCallback para evitar warning de dependencias
  const fetchEquipos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get(
        `/api/planillas-pago/${idfecha}/equipos-deudas`
      );
      setEquipos(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar equipos";
      onError?.(errorMessage);
      console.error("Error al cargar equipos:", err);
    } finally {
      setLoading(false);
    }
  }, [idfecha, onError]);

  useEffect(() => {
    fetchEquipos();
  }, [fetchEquipos]);

  const handleRegistrarPago = async () => {
    if (!selectedEquipo) return;

    try {
      await API.post("/api/planillas-pago/equipos/registrar-pago", {
        idfecha,
        idequipo: selectedEquipo.idequipo,
        tipopago: pagoForm.tipopago,
        importe: pagoForm.importe,
        iddeposito: pagoForm.iddeposito || null,
      });

      setShowModal(false);
      setPagoForm({ tipopago: 1, importe: 0, iddeposito: 0 });
      await fetchEquipos();
      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al registrar pago";
      onError?.(errorMessage);
      console.error("Error al registrar pago:", err);
    }
  };

  const currency = (n: number) => `$${n.toLocaleString("es-AR")}`;

  if (loading) return <div className="p-4">Cargando equipos...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold">Ingresos por Equipos</h3>

      {/* Tabla de Equipos */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Orden</th>
              <th className="px-3 py-2 text-left">Equipo</th>
              <th className="px-3 py-2 text-right">Deuda Insc.</th>
              <th className="px-3 py-2 text-right">Deuda Dep.</th>
              <th className="px-3 py-2 text-right">Deuda Fecha</th>
              <th className="px-3 py-2 text-right bg-blue-50">Total a Pagar</th>
              <th className="px-3 py-2 text-right bg-green-50">Pago Insc.</th>
              <th className="px-3 py-2 text-right bg-green-50">Pago Dep.</th>
              <th className="px-3 py-2 text-right bg-green-50">Pago Fecha</th>
              <th className="px-3 py-2 text-right bg-red-50 font-semibold">
                Deuda Total
              </th>
              {isEditable && <th className="px-3 py-2 text-center">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {equipos.length === 0 ? (
              <tr>
                <td
                  colSpan={isEditable ? 11 : 10}
                  className="px-3 py-6 text-center text-gray-500"
                >
                  No hay equipos registrados
                </td>
              </tr>
            ) : (
              equipos.map((equipo) => (
                <tr key={equipo.orden} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 text-center">{equipo.orden}</td>
                  <td className="px-3 py-2 font-medium">
                    {equipo.nombre_equipo}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {currency(equipo.deuda_inscripcion)}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {currency(equipo.deuda_deposito)}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {currency(equipo.deuda_fecha)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-blue-700">
                    {currency(equipo.total_a_pagar)}
                  </td>
                  <td className="px-3 py-2 text-right text-green-700">
                    {currency(equipo.pago_inscripcion)}
                  </td>
                  <td className="px-3 py-2 text-right text-green-700">
                    {currency(equipo.pago_deposito)}
                  </td>
                  <td className="px-3 py-2 text-right text-green-700">
                    {currency(equipo.pago_fecha)}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-red-700">
                    {currency(equipo.deuda_total)}
                  </td>
                  {isEditable && (
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => {
                          setSelectedEquipo(equipo);
                          setShowModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      >
                        Registrar Pago
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Registro de Pago */}
      {showModal && selectedEquipo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Registrar Pago - {selectedEquipo.nombre_equipo}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de Pago
                </label>
                <select
                  value={pagoForm.tipopago}
                  onChange={(e) =>
                    setPagoForm({
                      ...pagoForm,
                      tipopago: Number(e.target.value),
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value={1}>Inscripción (Efectivo)</option>
                  <option value={2}>Depósito (Transferencia)</option>
                  <option value={3}>Fecha (Débito)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Importe
                </label>
                <input
                  type="number"
                  value={pagoForm.importe}
                  onChange={(e) =>
                    setPagoForm({
                      ...pagoForm,
                      importe: Number(e.target.value),
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="0.00"
                />
              </div>

              {pagoForm.tipopago === 2 && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ID Depósito (opcional)
                  </label>
                  <input
                    type="number"
                    value={pagoForm.iddeposito}
                    onChange={(e) =>
                      setPagoForm({
                        ...pagoForm,
                        iddeposito: Number(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setPagoForm({ tipopago: 1, importe: 0, iddeposito: 0 });
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegistrarPago}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
