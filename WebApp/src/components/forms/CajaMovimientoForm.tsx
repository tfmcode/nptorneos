import React, { useEffect, useState, useCallback } from "react";
import MoneyInputField from "../common/MoneyInputField";
import { getFacturasPendientes } from "../../api/cajamovimientosService";
import { getComprobantesPorModulo } from "../../api/comprobantesService";
import ProveedorAutocomplete from "./ProveedorAutocomplete";
import { Proveedor } from "../../types/proveedores";
import { Factura } from "../../types/factura";
import { CajaAfectacion } from "../../types/cajamovimiento";

interface CajaMovimientoFormData {
  proveedor?: number;
  comprobante?: string;
  nrocomprobante?: number;
  fechaorigen?: string;
  fechavencimiento?: string;
  importeefectivo?: number;
  importecheque?: number;
  importeafectado?: number;
  importeneto?: number;
  cajaafectacion?: CajaAfectacion[];
}

interface FacturaAfectada {
  id: number;
  afedesccomprobante: string;
  afenrocomprobante?: number;
  importependafectar: number;
}

interface CajaMovimientoFormProps {
  formData: CajaMovimientoFormData;
  onChange: (
    name: string,
    value: string | number | boolean | CajaAfectacion[]
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
}

const CajaMovimientoForm: React.FC<CajaMovimientoFormProps> = ({
  formData,
  onChange,
  onSubmit,
  submitLabel = "Guardar",
}) => {
  const [facturasPendientes, setFacturasPendientes] = useState<Factura[]>([]);
  const [facturasAfectadas, setFacturasAfectadas] = useState<FacturaAfectada[]>(
    []
  );
  const [comprobantes, setComprobantes] = useState<
    { value: string; label: string }[]
  >([]);
  const [dcComprobante, setDcComprobante] = useState<number>(1);

  useEffect(() => {
    const modulo = 2;
    getComprobantesPorModulo(modulo)
      .then((data) => {
        const opciones = data.map(
          (item: { codigo: string; descripcion?: string }) => ({
            value: item.codigo,
            label: `${item.codigo} - ${item.descripcion ?? ""}`,
          })
        );
        setComprobantes(opciones);
      })
      .catch((err) => console.error("Error al cargar comprobantes:", err));
  }, []);

  useEffect(() => {
    if (
      formData?.cajaafectacion &&
      formData.cajaafectacion.length > 0 &&
      facturasAfectadas.length === 0
    ) {
      const afectadas: FacturaAfectada[] = formData.cajaafectacion.map(
        (af) => ({
          id: af.factura,
          afedesccomprobante: af.afedesccomprobante || "",
          afenrocomprobante: af.afenrocomprobante,
          importependafectar: af.importeafectado,
        })
      );
      setFacturasAfectadas(afectadas);
    }
  }, [formData.cajaafectacion, facturasAfectadas.length]);

  useEffect(() => {
    if (formData.proveedor && formData.comprobante) {
      getComprobantesPorModulo(2)
        .then((data) => {
          const comp = data.find(
            (c: { codigo: string; dc?: number }) =>
              c.codigo === formData.comprobante
          );
          if (comp) {
            setDcComprobante(comp.dc || 1);
          }
        })
        .catch((err) => console.error("Error al obtener DC:", err));

      const dcActual = dcComprobante;
      getFacturasPendientes(formData.proveedor, dcActual === -1 ? -1 : 1)
        .then((data) => setFacturasPendientes(data))
        .catch((err) =>
          console.error("Error al cargar facturas pendientes:", err)
        );
    }
  }, [formData.proveedor, formData.comprobante, dcComprobante]);

  const toggleFacturaAfectada = useCallback(
    (factura: Factura, checked: boolean) => {
      const transformada: FacturaAfectada = {
        id: factura.id!,
        afedesccomprobante: factura.desccomprobante || "",
        afenrocomprobante: factura.nrocomprobante,
        importependafectar: Math.abs(factura.importependafectar || 0),
      };

      if (checked) {
        setFacturasAfectadas((prev) => [...prev, transformada]);
      } else {
        setFacturasAfectadas((prev) =>
          prev.filter((f) => f.id !== transformada.id)
        );
      }
    },
    []
  );

  useEffect(() => {
    const cajaafectacionTransformada: CajaAfectacion[] = facturasAfectadas.map(
      (fa) => ({
        factura: fa.id,
        importeafectado: fa.importependafectar,
        afedesccomprobante: fa.afedesccomprobante,
        afenrocomprobante: fa.afenrocomprobante,
      })
    );

    const totalAfectado = facturasAfectadas.reduce(
      (sum, fa) => sum + (fa.importependafectar || 0),
      0
    );

    onChange("cajaafectacion", cajaafectacionTransformada);
    onChange("importeafectado", totalAfectado);
  }, [facturasAfectadas, onChange]);

  const handleProveedorSelect = useCallback(
    (proveedor: Proveedor | null) => {
      onChange("proveedor", proveedor?.id ?? 0);
      setFacturasPendientes([]);
      setFacturasAfectadas([]);
    },
    [onChange]
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold">Datos Generales</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Proveedor
          </label>
          <ProveedorAutocomplete
            value={formData.proveedor ?? 0}
            onChange={handleProveedorSelect}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Comprobante
          </label>
          <select
            name="comprobante"
            value={formData.comprobante ?? ""}
            onChange={(e) => onChange(e.target.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700"
          >
            <option value="">Seleccione un comprobante</option>
            {comprobantes.map((comp) => (
              <option key={comp.value} value={comp.value}>
                {comp.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            N° Comprobante
          </label>
          <input
            type="number"
            name="nrocomprobante"
            value={formData.nrocomprobante ?? 0}
            onChange={(e) =>
              onChange(e.target.name, parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha Origen
          </label>
          <input
            type="date"
            name="fechaorigen"
            value={formData.fechaorigen || ""}
            onChange={(e) => onChange(e.target.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha Vencimiento
          </label>
          <input
            type="date"
            name="fechavencimiento"
            value={formData.fechavencimiento || ""}
            onChange={(e) => onChange(e.target.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700"
          />
        </div>
      </div>

      <fieldset className="border rounded p-4">
        <legend className="text-lg font-semibold">Importes</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Importe Efectivo
            </label>
            <MoneyInputField
              name="importeefectivo"
              type="number"
              placeholder="0.00"
              value={String(formData.importeefectivo ?? 0)}
              onChange={(e) =>
                onChange(e.target.name, parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Importe Cheque
            </label>
            <MoneyInputField
              name="importecheque"
              type="number"
              placeholder="0.00"
              value={String(formData.importecheque ?? 0)}
              onChange={(e) =>
                onChange(e.target.name, parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Importe Afectado
            </label>
            <MoneyInputField
              name="importeafectado"
              type="number"
              placeholder="0.00"
              value={String(formData.importeafectado ?? 0)}
              onChange={(e) =>
                onChange(e.target.name, parseFloat(e.target.value) || 0)
              }
              disabled
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Importe Neto
            </label>
            <MoneyInputField
              name="importeneto"
              type="number"
              placeholder="0.00"
              value={String(formData.importeneto ?? 0)}
              onChange={(e) =>
                onChange(e.target.name, parseFloat(e.target.value) || 0)
              }
            />
          </div>
        </div>
      </fieldset>

      {formData.proveedor && formData.comprobante && (
        <>
          <div>
            <h3 className="text-md font-semibold mb-2">Facturas Pendientes</h3>
            {facturasPendientes.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No hay facturas pendientes para este proveedor
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-center w-12"></th>
                      <th className="px-3 py-2 text-left">Comprobante</th>
                      <th className="px-3 py-2 text-center">N°</th>
                      <th className="px-3 py-2 text-right">Saldo Pend.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturasPendientes.map((factura) => (
                      <tr
                        key={factura.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              toggleFacturaAfectada(factura, e.target.checked)
                            }
                            checked={facturasAfectadas.some(
                              (f) => f.id === factura.id
                            )}
                          />
                        </td>
                        <td className="px-3 py-2">{factura.desccomprobante}</td>
                        <td className="px-3 py-2 text-center">
                          {factura.nrocomprobante}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatCurrency(
                            Math.abs(factura.importependafectar || 0)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {facturasAfectadas.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-2">Facturas Afectadas</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border text-sm">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Comprobante</th>
                      <th className="px-3 py-2 text-center">N°</th>
                      <th className="px-3 py-2 text-right">Importe</th>
                      <th className="px-3 py-2 text-center w-20">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturasAfectadas.map((factura) => (
                      <tr
                        key={factura.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-3 py-2">
                          {factura.afedesccomprobante}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {factura.afenrocomprobante}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatCurrency(factura.importependafectar)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const facturaOriginal = facturasPendientes.find(
                                (f) => f.id === factura.id
                              );
                              if (facturaOriginal) {
                                toggleFacturaAfectada(facturaOriginal, false);
                              }
                            }}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td colSpan={2} className="px-3 py-2 text-right">
                        Total Afectado:
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(formData.importeafectado || 0)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default CajaMovimientoForm;
