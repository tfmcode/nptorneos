export interface EquipoJugador {
  id?: number;
  idjugador: number;
  idequipo: number;
  camiseta?: number;
  capitan?: number; // Cambiado de boolean a number (0 o 1)
  subcapitan?: number; // Cambiado de boolean a number (0 o 1)
  codtipo?: number;
  codestado?: number; // Estado del jugador en el equipo (wequipos_jugadores)
  jugador_codestado?: number; // Estado global del jugador (tabla jugadores) - 0=baja, 1=habilitado
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
