export interface CajaAfectacion {
  id?: number;
  cajamovimiento?: number;
  factura: number;
  importeafectado: number;
  afedesccomprobante?: string;
  afenrocomprobante?: number;
}

export interface CajaMovimiento {
  [key: string]: unknown; // Signatura de índice para compatibilidad con DataTable
  id?: number;
  comprobante?: string;
  desccomprobante?: string;
  proveedor: number;
  proveedornombre?: string;
  nrocomprobante?: number;
  fechaorigen?: Date | string;
  fechavencimiento?: Date | string;
  importeefectivo?: number;
  importecheque?: number;
  importeafectado?: number;
  importeneto?: number;
  dc?: number;
  estado?: string;
  cajaafectacion?: CajaAfectacion[];
}

export interface CajaMovimientoInput {
  [key: string]: unknown; // Signatura de índice para compatibilidad con useCrudForm
  comprobante?: string;
  proveedor: number;
  nrocomprobante?: number;
  fechaorigen?: string;
  fechavencimiento?: string;
  importeefectivo?: number;
  importecheque?: number;
  importeafectado?: number;
  importeneto?: number;
  cajaafectacion?: CajaAfectacion[];
}
