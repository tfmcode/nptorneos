import { CajaMovimiento } from "../../../types/cajamovimiento";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);
};

export const cajamovimientoColumns = [
  {
    header: "N° Comprobante",
    accessor: "nrocomprobante" as keyof CajaMovimiento,
  },
  {
    header: "Fecha Origen",
    accessor: "fechaorigen" as keyof CajaMovimiento,
    render: (cajamovimiento: CajaMovimiento) =>
      cajamovimiento.fechaorigen
        ? new Date(cajamovimiento.fechaorigen).toLocaleDateString("es-AR")
        : "",
  },
  {
    header: "Fecha Vto.",
    accessor: "fechavencimiento" as keyof CajaMovimiento,
    render: (cajamovimiento: CajaMovimiento) =>
      cajamovimiento.fechavencimiento
        ? new Date(cajamovimiento.fechavencimiento).toLocaleDateString("es-AR")
        : "",
  },
  {
    header: "Comprobante",
    accessor: "desccomprobante" as keyof CajaMovimiento,
  },
  {
    header: "Proveedor",
    accessor: "proveedornombre" as keyof CajaMovimiento,
    render: (cajamovimiento: CajaMovimiento) =>
      cajamovimiento.proveedornombre || `ID: ${cajamovimiento.proveedor}`,
  },
  {
    header: "Tipo",
    accessor: "dc" as keyof CajaMovimiento,
    render: (cajamovimiento: CajaMovimiento) => {
      if (cajamovimiento.dc === -1) {
        return <span className="text-red-600 font-semibold">Pago</span>;
      } else if (cajamovimiento.dc === 1) {
        return <span className="text-green-600 font-semibold">Cobro</span>;
      }
      return <span className="text-gray-600">-</span>;
    },
  },
  {
    header: "Importe Afectado",
    accessor: "importeafectado" as keyof CajaMovimiento,
    render: (cajamovimiento: CajaMovimiento) =>
      formatCurrency(cajamovimiento.importeafectado || 0),
  },
  {
    header: "Importe Neto",
    accessor: "importeneto" as keyof CajaMovimiento,
    render: (cajamovimiento: CajaMovimiento) =>
      formatCurrency(cajamovimiento.importeneto || 0),
  },
];