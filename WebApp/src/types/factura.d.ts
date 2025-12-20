export interface Factura {
  [key: string]: unknown; // Signatura de índice para compatibilidad con DataTable
  id?: number;
  comprobante?: string;
  desccomprobante?: string;
  proveedor: number;
  proveedornombre?: string;
  fechaorigen?: Date | string;
  fechavencimiento?: Date | string;
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
  importependafectar?: number;
  dc?: number;
  afecta?: number;
  estado?: string;
}

export interface FacturaInput {
  [key: string]: unknown; // Signatura de índice para compatibilidad con useCrudForm
  comprobante?: string;
  proveedor: number;
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
