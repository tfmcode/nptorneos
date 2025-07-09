export interface Sancion {
  id?: number;
  fecha?: string;
  idjugador?: number;
  idequipo?: number;
  idtorneo?: number;
  titulo?: string;
  descripcion?: string;
  codestado?: number;
  fhcarga?: string;
  fhbaja?: string;
  idusuario: number;
  fechafin?: string;
  jugador?: string;
  equipo?: string;
  torneo?: string;
  [key: string]: unknown;
}

export interface SancionInput {
  fecha?: string;
  idjugador?: number;
  idequipo?: number;
  idtorneo?: number;
  titulo?: string;
  descripcion?: string;
  codestado?: number;
  idusuario: number;
  fechafin?: string;
}
