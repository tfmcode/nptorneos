export interface Jugador {
  id?: number;
  nombres: string;
  apellido: string;
  fhnacimiento?: string;
  docnro: string;
  telefono?: string;
  email?: string;
  facebook?: string;
  twitter?: string;
  peso?: string;
  altura?: string;
  apodo?: string;
  posicion?: string;
  categoria?: string;
  piernahabil?: string;
  codestado?: number;
  fhcarga?: string;
  fhbaja?: string | null;
  fhultmod?: string;
  usrultmod?: number;
  foto?: string;
  [key: string]: unknown;
}

export interface JugadorInput {
  nombres: string;
  apellido: string;
  fhnacimiento?: string;
  docnro: string;
  telefono?: string;
  email?: string;
  facebook?: string;
  twitter?: string;
  peso?: string;
  altura?: string;
  apodo?: string;
  posicion?: string;
  categoria?: string;
  piernahabil?: string;
  codestado?: number;
  foto?: string;
}
