import { Factura } from "../../../types/factura";

export const facturaColumns = [
  {
    header: "N° Comprobante",
    accessor: "nrocomprobante" as keyof Factura,
  },
  {
    header: "Fecha Origen",
    accessor: "fechaorigen" as keyof Factura,
    render: (factura: Factura) =>
      factura.fechaorigen ? new Date(factura.fechaorigen).toLocaleDateString("es-AR") : "",
  },
  {
    header: "Fecha Vto.",
    accessor: "fechavencimiento" as keyof Factura,
    render: (factura: Factura) =>
      factura.fechavencimiento ? new Date(factura.fechavencimiento).toLocaleDateString("es-AR") : "",
  },
  {
    header: "Comprobante",
    accessor: "desccomprobante" as keyof Factura,
  },
  {
    header: "Tipo",
    accessor: "tipo" as keyof Factura,
  },
  {
    header: "Proveedor",
    accessor: "proveedor" as keyof Factura,
  },
  {
    header: "Pago",
    accessor: "formapago" as keyof Factura,
  },
  {
    header: "Ingr. Bru.",
    accessor: "importeingrbru" as keyof Factura,
  },
  {
    header: "IVA",
    accessor: "importeiva" as keyof Factura,
  },
  {
    header: "Importe",
    accessor: "importetotal" as keyof Factura,
  },
];
