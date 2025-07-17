export interface InscripcionJugador {
  id?: number;
  idinscrip?: number;
  orden?: number;
  apellido?: string;
  nombres?: string;
  docnro?: number;
  fhnacimiento?: string;
  telefono?: string;
  email?: string;
  posicion?: string;
  facebook?: string;
  fhcarga?: string;
  fhbaja?: string;
  capitan?: number;
  subcapitan?: number;
  jugadorexistente?: boolean;
  sancion?: boolean;
  listanegra?: boolean;
  [key: string]: unknown;
}

export interface InscripcionJugadorInput {
  idinscrip?: number;
  orden?: number;
  apellido?: string;
  nombres?: string;
  docnro?: number;
  fhnacimiento?: string;
  telefono?: string;
  email?: string;
  posicion?: string;
  facebook?: string;
  capitan?: number;
  subcapitan?: number;
}
