export interface ListaNegra {
  id?: number;
  idjugador: number;
  fecha?: string;
  observ?: string;
  fhbaja?: string | null;
  fhultmod?: string;
  usrultmod?: number;
  codestado?: number; // 0 = inhabilitado, 1 = habilitado
  fhcarga?: string;
  nombres?: string; 
  apellido?: string;
  [key: string]: unknown;
}

export interface ListaNegraInput {
  idjugador: number;
  fecha?: string;
  observ?: string;
  codestado?: number;
  usrultmod?: number;
}
