export interface Inscripcion {
  id?: number;
  email?: string;
  equipo?: string;
  idtorneo?: number;
  codestado?: number;
  fhcarga?: string;
  fhbaja?: string;
  idzona?: number;
  idequipoasoc?: number;
  foto?: string;
  torneo?: string;
  [key: string]: unknown;
}

export interface InscripcionInput {
  email?: string;
  equipo?: string;
  idtorneo?: number;
  codestado?: number;
  idzona?: number;
  idequipoasoc?: number;
  foto?: string;
}
