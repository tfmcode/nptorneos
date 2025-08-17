export interface CajaMovimiento {
  id?: number;
  fechaorigen: string;
  proveedor: string;
  comprobante: string;
  desccomprobante?: string;
  nrocomprobante: number;
  fechavencimiento: string;
  importeefectivo: number;
  importecheque: number;
  importeafectado: number;
  importeneto: number;
  estado?: number;
  cajaafectacion?: CajaAfectacion[];
  [key: string]: unknown;
}

export interface CajaAfectacion {
  id: number;
  cajamovimiento: number;
  factura: number;
  importeafectado: number;
}