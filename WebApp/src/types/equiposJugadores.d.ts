export interface EquipoJugador {
  id?: number;
  idjugador: number;
  idequipo: number;
  camiseta?: number;
  capitan?: number; // Cambiado de boolean a number (0 o 1)
  subcapitan?: number; // Cambiado de boolean a number (0 o 1)
  codtipo?: number;
  codestado?: number;
  fhcarga?: string;
  fhbaja?: string | null;
  idusuario: number;
  apellido?: string;
  nombres?: string;
  nombre?: string; // Agregado para el ordenamiento
  docnro?: number;
  tipo_desc?: string;
  [key: string]: unknown;
}

export interface EquipoJugadorInput {
  id?: number; // Agregado para las actualizaciones
  idjugador: number;
  idequipo: number;
  camiseta?: number;
  capitan?: number; // Cambiado de boolean a number (0 o 1)
  subcapitan?: number; // Cambiado de boolean a number (0 o 1)
  codtipo?: number;
  codestado?: number;
  idusuario: number;
}
