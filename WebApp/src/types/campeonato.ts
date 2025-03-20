export interface Campeonato {
  id?: number;
  nombre: string;
  coddeporte: number;
  codestado?: number;
  fhcarga?: string; // Fecha de creación
  fhbaja?: string | null; // Soft delete
  fhultmod?: string; // Última modificación
  usrultmod?: number; // Usuario que modificó
  [key: string]: unknown;
}

export interface CampeonatoInput {
  nombre: string;
  coddeporte: number;
  codestado?: number;
}
