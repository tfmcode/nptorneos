import { CajaMovimiento } from "../../../types/cajamovimiento";

export const cajamovimientoColumns = [
  {
    header: "N° Comprobante",
    accessor: "nrocomprobante" as keyof CajaMovimiento,
  },
  {
    header: "Fecha Origen",
    accessor: "fechaorigen" as keyof CajaMovimiento,
    render: (cajamovimiento: CajaMovimiento) =>
      cajamovimiento.fechaorigen ? new Date(cajamovimiento.fechaorigen).toLocaleDateString("es-AR") : "",
  },
  {
    header: "Fecha Vto.",
    accessor: "fechavencimiento" as keyof CajaMovimiento,
    render: (cajamovimiento: CajaMovimiento) =>
      cajamovimiento.fechavencimiento ? new Date(cajamovimiento.fechavencimiento).toLocaleDateString("es-AR") : "",
  },
  {
    header: "Comprobante",
    accessor: "desccomprobante" as keyof CajaMovimiento,
  },
  {
    header: "Proveedor",
    accessor: "proveedor" as keyof CajaMovimiento,
  },
  {
    header: "Importe",
    accessor: "importeneto" as keyof CajaMovimiento,
  },
];
