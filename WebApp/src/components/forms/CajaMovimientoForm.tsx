import React, { useEffect, useState } from "react";
import MoneyInputField from "../common/MoneyInputField";
import { getFacturasPendientes } from "../../api/cajamovimientosService";

interface CajaMovimientoFormProps {
  formData: any;
  onChange: (name: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
}

const CajaMovimientoForm: React.FC<CajaMovimientoFormProps> = ({
  formData,
  onChange,
  onSubmit,
  submitLabel = "Guardar",
}) => {
  const [facturasPendientes, setFacturasPendientes] = useState<any[]>([]);
  const [facturasAfectadas, setFacturasAfectadas] = useState<any[]>([]);

  useEffect(() => {
    if (formData?.cajaafectacion?.length > 0 && facturasAfectadas.length === 0) {
      // Si vienen afectaciones desde el backend al editar, las usamos
      const afectadas = formData.cajaafectacion.map((af: any) => ({
        id: af.factura,
        afedesccomprobante: af.afedesccomprobante,
        afenrocomprobante: af.afenrocomprobante,
        importependafectar: af.importeafectado,
      }));
      setFacturasAfectadas(afectadas);
    }
  }, [formData.cajaafectacion]);

  // Buscar facturas pendientes al seleccionar proveedor
  useEffect(() => {
    if (formData.proveedor) {
      getFacturasPendientes(formData.proveedor, formData.dc ?? 1) // dc puede ser 1 o -1
        .then((data) => setFacturasPendientes(data))
        .catch((err) => console.error("Error al cargar facturas pendientes:", err));
    }
  }, [formData.proveedor]);
  

  const toggleFacturaAfectada = (factura: any, checked: boolean) => {
    const transformada = {
      id: factura.id,
      afedesccomprobante: factura.desccomprobante,
      afenrocomprobante: factura.nrocomprobante,
      importependafectar: factura.importependafectar,
    };

    if (checked) {
      setFacturasAfectadas((prev) => [...prev, transformada]);
    } else {
      setFacturasAfectadas((prev) =>
        prev.filter((f) => f.id !== transformada.id)
      );
    }
  };
  
  useEffect(() => {
    const cajaafectacionTransformada = facturasAfectadas.map((fa) => ({
      factura: fa.id,
      importeafectado: fa.importependafectar,
    }));
    onChange("cajaafectacion", cajaafectacionTransformada);
  }, [facturasAfectadas]);


  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold">Datos Generales</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label>Proveedor</label>
          <input
            type="text"
            name="proveedor"
            value={formData.proveedor ?? ""}
            onChange={(e) => onChange(e.target.name, e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label>Comprobante</label>
          <input
            type="text"
            name="comprobante"
            value={formData.comprobante ?? ""}
            onChange={(e) => onChange(e.target.name, e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label>N° Comprobante</label>
          <input
            type="number"
            name="nrocomprobante"
            value={formData.nrocomprobante ?? 0}
            onChange={(e) => onChange(e.target.name, e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label>Fecha Origen</label>
          <input
            type="date"
            name="fechaorigen"
            value={formData.fechaorigen || ""}
            onChange={(e) => onChange(e.target.name, e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label>Fecha Vencimiento</label>
          <input
            type="date"
            name="fechavencimiento"
            value={formData.fechavencimiento || ""}
            onChange={(e) => onChange(e.target.name, e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            name="pagoautomatico"
            checked={!!formData.pagoautomatico}
            onChange={(e) => onChange(e.target.name, e.target.checked)}
            className="mr-2"
          />
          <label>Pago Automático</label>
        </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Importe Efectivo</label>
            <MoneyInputField
              name="importeefectivo"
              type="number"
              placeholder="0.00" 
              value={String(formData.importeefectivo ?? 0)}
              onChange={(e) => onChange(e.target.name, e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Importe Cheque</label>
            <MoneyInputField
              name="importecheque"
              type="number"
              placeholder="0.00" 
              value={String(formData.importecheque ?? 0)}
              onChange={(e) => onChange(e.target.name, e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Importe Afectado</label>
            <MoneyInputField
              name="importeafectado"
              type="number"
              placeholder="0.00" 
              value={String(formData.importeafectado ?? 0)}
              onChange={(e) => onChange(e.target.name, e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Importe Neto</label>
            <MoneyInputField
              name="importeneto"
              type="number"
              placeholder="0.00" 
              value={String(formData.importeneto ?? 0)}
              onChange={(e) => onChange(e.target.name, e.target.value)}
            />
          </div>
      </div>

      {/* Listado de Facturas Pendientes */}
      <div>
        <h3 className="text-md font-semibold mt-6 mb-2">Facturas Pendientes</h3>
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-gray-200">
              <th></th>
              <th>Comprobante</th>
              <th>N°</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {facturasPendientes.map((factura) => (
              <tr key={factura.id}>
                <td className="text-center">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      toggleFacturaAfectada(factura, e.target.checked)
                    }
                    checked={facturasAfectadas.some((f) => f.id === factura.id)}
                  />
                </td>
                <td>{factura.desccomprobante}</td>
                <td>{factura.nrocomprobante}</td>
                <td>{factura.importependafectar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Listado de Facturas Afectadas */}
      <div>
        <h3 className="text-md font-semibold mt-6 mb-2">Facturas Afectadas</h3>
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-gray-200">
              <th>Comprobante</th>
              <th>N°</th>
              <th>Importe</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {facturasAfectadas.map((factura) => (
              <tr key={factura.id}>
                <td>{factura.afedesccomprobante}</td>
                <td>{factura.afenrocomprobante}</td>
                <td>{factura.importependafectar}</td>
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      toggleFacturaAfectada(factura, false)
                    }
                    className="text-red-600 hover:underline"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default CajaMovimientoForm;
