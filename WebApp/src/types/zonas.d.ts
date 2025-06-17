export interface Zona {
  id?: number;
  idtorneo?: number;
  nombre: string;
  abrev: string;
  codcantfechas?: number;
  codfechaactual?: number;
  codestado?: number;
  fhcarga?: string;
  fhbaja?: string;
  idusuario: number;
  amistoso?: number;
  [key: string]: unknown;
}

export interface ZonaInput {
  nombre: string;
  abrev: string;
  codcantfechas?: number;
  codfechaactual?: number;
  amistoso?: number;
}
