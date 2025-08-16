import React, { useEffect, useState } from "react";
import { getComprobantesPorModulo } from "../../api/comprobantesService";
import MoneyInputField from "../common/MoneyInputField";

interface FacturaFormProps {
  formData: any;
  onChange: (name: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
}

const FacturaForm: React.FC<FacturaFormProps> = ({ formData, onChange, onSubmit, submitLabel = "Guardar" }) => {
  const nroValue = Number(formData.nrocomprobante) || 0;
  const ptoventa = Math.floor(nroValue / 100000000).toString().padStart(4, "0");
  const nroparte = (nroValue % 100000000).toString().padStart(8, "0");
  const [comprobantes, setComprobantes] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const modulo = 1; // Facturación
    getComprobantesPorModulo(modulo)
      .then((data) => {
        const opciones = data.map((item: any) => ({
          value: item.codigo,
          label: `${item.codigo} - ${item.descripcion}`,
        }));
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

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold">Datos Generales</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="space-y-4 md:col-span-2 w-full md:w-[86%]">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Comprobante</label>
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Proveedor</label>
            <input type="text" name="proveedor" value={formData.proveedor ?? ""} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Origen</label>
            <input type="date" name="fechaorigen" value={formData.fechaorigen || ""} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-100 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Vencimiento</label>
            <input type="date" name="fechavencimiento" value={formData.fechavencimiento || ""} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-100 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Forma de Pago</label>
            <input type="text" name="formapago" value={formData.formapago ?? ""} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="pagoautomatico" checked={!!formData.pagoautomatico} onChange={(e) => onChange(e.target.name, e.target.checked)} className="mr-2" />
            <label>Pago Automático</label>
          </div>
        </div>
        <fieldset className="border rounded p-4 w-full md:w-auto">
          <legend className="text-lg font-semibold">Datos Comprobante</legend>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">N° Comprobante</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
              <input type="text" name="tipo" value={formData.tipo ?? ""} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700" />
            </div>
          </div>
        </fieldset>
      </div>

      <fieldset className="border rounded p-4">
        <legend className="text-lg font-semibold">Importes</legend>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Importe Subtotal</label>
            <MoneyInputField name="importesubtotal" type="number" placeholder="0.00" value={String(formData.importesubtotal ?? 0)} onChange={(e) => onChange(e.target.name, e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Importe Ingr. Br.</label>
              <MoneyInputField name="importeingrbru" type="number" placeholder="0.00" value={String(formData.importeingrbru ?? 0)} onChange={(e) => onChange(e.target.name, e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Alicuota Ingr. Br.</label>
              <input type="number" name="alicuotaingrbru" value={formData.alicuotaingrbru ?? 0} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Importe IVA</label>
              <MoneyInputField name="importeiva" type="number" placeholder="0.00" value={String(formData.importeiva ?? 0)} onChange={(e) => onChange(e.target.name, e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Alicuota IVA</label>
              <input type="number" name="alicuotaiva" value={formData.alicuotaiva ?? 0} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Importe Total</label>
            <MoneyInputField name="importetotal" type="number" placeholder="0.00" value={String(formData.importetotal ?? 0)} onChange={(e) => onChange(e.target.name, e.target.value)} />
          </div>
        </div>
      </fieldset>

      <div className="flex justify-end">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default FacturaForm;
