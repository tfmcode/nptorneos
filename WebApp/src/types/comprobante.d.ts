export interface Comprobante {
  codigo: string;
  descripcion?: string;
  dc?: number;
  visible?: number;
  modulo?: number;
  [key: string]: unknown;
}