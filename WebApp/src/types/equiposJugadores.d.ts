export interface EquipoJugador {
  id?: number;
  idjugador: number;
  idequipo: number;
  camiseta?: number;
  capitan?: boolean;
  subcapitan?: boolean;
  codtipo?: number;
  codestado?: number;
  fhcarga?: string;
  fhbaja?: string | null;
  idusuario: number;
  apellido?: string;
  nombres?: string;
  docnro?: number;
  tipo_desc?: string;
  [key: string]: unknown;
}

export interface EquipoJugadorInput {
  idjugador: number;
  idequipo: number;
  camiseta?: number;
  capitan?: boolean;
  subcapitan?: boolean;
  codtipo?: number;
  codestado?: number;
  idusuario: number;
}
