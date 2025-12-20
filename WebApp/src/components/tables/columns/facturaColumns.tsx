import { Factura } from "../../../types/factura";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);
};

const getEstadoBadge = (estado?: string) => {
  const estados: Record<string, { label: string; color: string }> = {
    PE: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    PA: { label: "Pagada", color: "bg-green-100 text-green-800" },
    AN: { label: "Anulada", color: "bg-red-100 text-red-800" },
  };

  const estadoInfo = estados[estado || "PE"] || {
    label: "Desconocido",
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
      {estadoInfo.label}
    </span>
  );
};

export const facturasColumns = [
  {
    header: "N° Comprobante",
    accessor: "nrocomprobante" as keyof Factura,
  },
  {
    header: "Fecha Origen",
    accessor: "fechaorigen" as keyof Factura,
    render: (factura: Factura) =>
      factura.fechaorigen
        ? new Date(factura.fechaorigen).toLocaleDateString("es-AR")
        : "",
  },
  {
    header: "Fecha Vto.",
    accessor: "fechavencimiento" as keyof Factura,
    render: (factura: Factura) =>
      factura.fechavencimiento
        ? new Date(factura.fechavencimiento).toLocaleDateString("es-AR")
        : "",
  },
  {
    header: "Comprobante",
    accessor: "desccomprobante" as keyof Factura,
  },
  {
    header: "Proveedor",
    accessor: "proveedornombre" as keyof Factura,
    render: (factura: Factura) =>
      factura.proveedornombre || `ID: ${factura.proveedor}`,
  },
  {
    header: "Tipo",
    accessor: "tipo" as keyof Factura,
  },
  {
    header: "Total",
    accessor: "importetotal" as keyof Factura,
    render: (factura: Factura) => formatCurrency(factura.importetotal || 0),
  },
  {
    header: "Saldo Pend.",
    accessor: "importependafectar" as keyof Factura,
    render: (factura: Factura) =>
      formatCurrency(Math.abs(factura.importependafectar || 0)),
  },
  {
    header: "Estado",
    accessor: "estado" as keyof Factura,
    render: (factura: Factura) => getEstadoBadge(factura.estado),
  },
];
