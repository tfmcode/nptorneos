export interface Factura {
  id?: number;
  fechaorigen: string;
  proveedor: string;
  comprobante: string;
  desccomprobante?: string;
  tipo: string;
  nrocomprobante: number;
  fechavencimiento: string;
  formapago: string;
  pagoautomatico: boolean;
  importesubtotal: number;
  importeingrbru: number;
  importeiva: number;
  alicuotaingrbru: number;
  alicuotaiva: number;
  importetotal: number;
  [key: string]: unknown;
}

export interface FacturaInput {
  fechaorigen: string;
  proveedor?: string;
  comprobante?: string;
  tipo?: string;
  nrocomprobante?: number;
  fechavencimiento?: string;
  formapago?: string;
  pagoautomatico?: boolean;
  importesubtotal?: number;
  importeingrbru?: number;
  importeiva?: number;
  alicuotaingrbru?: number;
  alicuotaiva?: number;
  importetotal?: number;
}
