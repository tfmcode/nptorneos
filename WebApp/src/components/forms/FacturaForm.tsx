import React, { useEffect, useState } from "react";
import { getComprobantesPorModulo } from "../../api/comprobantesService";
import MoneyInputField from "../common/MoneyInputField";
import ProveedorAutocomplete from "./ProveedorAutocomplete";
import { Proveedor } from "../../types/proveedores";

interface FacturaFormData {
  comprobante?: string;
  proveedor?: number;
  fechaorigen?: string;
  fechavencimiento?: string;
  formapago?: number;
  pagoautomatico?: boolean;
  nrocomprobante?: number;
  tipo?: string;
  importesubtotal?: number;
  importeingrbru?: number;
  alicuotaingrbru?: number;
  importeiva?: number;
  alicuotaiva?: number;
  importetotal?: number;
}

interface FacturaFormProps {
  formData: FacturaFormData;
  onChange: (name: string, value: string | number | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
}

const FacturaForm: React.FC<FacturaFormProps> = ({
  formData,
  onChange,
  onSubmit,
  submitLabel = "Guardar",
}) => {
  const nroValue = Number(formData.nrocomprobante) || 0;
  const ptoventa = Math.floor(nroValue / 100000000)
    .toString()
    .padStart(4, "0");
  const nroparte = (nroValue % 100000000).toString().padStart(8, "0");
  const [comprobantes, setComprobantes] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const modulo = 1;
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

  const handlePtoVentaChange = (value: string) => {
    const pto = parseInt(value) || 0;
    const nro = parseInt(nroparte) || 0;
    const nroCompleto = pto * 100000000 + nro;
    onChange("nrocomprobante", nroCompleto);
  };

  const handleNroParteChange = (value: string) => {
    const pto = parseInt(ptoventa) || 0;
    const nro = parseInt(value) || 0;
    const nroCompleto = pto * 100000000 + nro;
    onChange("nrocomprobante", nroCompleto);
  };

  const handleProveedorSelect = (proveedor: Proveedor | null) => {
    onChange("proveedor", proveedor?.id ?? 0);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold">Datos Generales</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="space-y-4 md:col-span-2 w-full md:w-[86%]">
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
              Proveedor
            </label>
            <ProveedorAutocomplete
              value={formData.proveedor ?? 0}
              onChange={handleProveedorSelect}
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
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Forma de Pago
            </label>
            <select
              name="formapago"
              value={formData.formapago ?? 1}
              onChange={(e) =>
                onChange(e.target.name, parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700"
            >
              <option value={1}>Efectivo</option>
              <option value={2}>Transferencia</option>
              <option value={3}>Cheque</option>
              <option value={4}>Tarjeta</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="pagoautomatico"
              checked={!!formData.pagoautomatico}
              onChange={(e) => onChange(e.target.name, e.target.checked)}
              className="mr-2"
            />
            <label>Pago Automático</label>
          </div>
        </div>
        <fieldset className="border rounded p-4 w-full md:w-auto">
          <legend className="text-lg font-semibold">Datos Comprobante</legend>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                N° Comprobante
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ptoventa}
                  onChange={(e) => handlePtoVentaChange(e.target.value)}
                  maxLength={4}
                  className="border border-gray-300 text-sm text-gray-700 rounded p-2 w-1/3"
                  placeholder="0000"
                />
                <input
                  type="text"
                  value={nroparte}
                  onChange={(e) => handleNroParteChange(e.target.value)}
                  maxLength={8}
                  className="border border-gray-300 text-sm text-gray-700 rounded p-2 w-2/3"
                  placeholder="00000000"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                name="tipo"
                value={formData.tipo ?? "A"}
                onChange={(e) => onChange(e.target.name, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="E">E</option>
              </select>
            </div>
          </div>
        </fieldset>
      </div>

      <fieldset className="border rounded p-4">
        <legend className="text-lg font-semibold">Importes</legend>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Importe Subtotal
            </label>
            <MoneyInputField
              name="importesubtotal"
              type="number"
              placeholder="0.00"
              value={String(formData.importesubtotal ?? 0)}
              onChange={(e) =>
                onChange(e.target.name, parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alícuota Ingr. Br. (%)
              </label>
              <input
                type="number"
                name="alicuotaingrbru"
                step="0.01"
                value={formData.alicuotaingrbru ?? 0}
                onChange={(e) =>
                  onChange(e.target.name, parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Importe Ingr. Br.
              </label>
              <MoneyInputField
                name="importeingrbru"
                type="number"
                placeholder="0.00"
                value={String(formData.importeingrbru ?? 0)}
                onChange={(e) =>
                  onChange(e.target.name, parseFloat(e.target.value) || 0)
                }
                disabled
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alícuota IVA (%)
              </label>
              <input
                type="number"
                name="alicuotaiva"
                step="0.01"
                value={formData.alicuotaiva ?? 0}
                onChange={(e) =>
                  onChange(e.target.name, parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Importe IVA
              </label>
              <MoneyInputField
                name="importeiva"
                type="number"
                placeholder="0.00"
                value={String(formData.importeiva ?? 0)}
                onChange={(e) =>
                  onChange(e.target.name, parseFloat(e.target.value) || 0)
                }
                disabled
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Importe Total
            </label>
            <MoneyInputField
              name="importetotal"
              type="number"
              placeholder="0.00"
              value={String(formData.importetotal ?? 0)}
              onChange={(e) =>
                onChange(e.target.name, parseFloat(e.target.value) || 0)
              }
              disabled
            />
          </div>
        </div>
      </fieldset>

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

export default FacturaForm;
