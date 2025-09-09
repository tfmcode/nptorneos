export type PartidoJugadorBase = {
  idpartido: number;
  idequipo: number;
  idjugador: number;
  goles: number;
  camiseta: string;
  amarilla: number;
  azul: number;
  roja: number;
};

export type PartidoJugador = PartidoJugadorBase & {
  jugo: boolean;
};

// En types/partidosJugadores.d.ts
export interface PartidoJugadorInput {
  idjugador: number;
  jugo: boolean;
  camiseta: string;
  goles: number;
  amarilla: number;
  azul: number;
  roja: number;
  fhcarga?: string; // Agregar este campo
  idusuario?: number; // Agregar este campo
}

export type PartidoJugadorExtendido = PartidoJugador & {
  nombre: string;
  docnro: number; // ← Corregido: debería ser number según tu DB
  codtipo: number; // 1 = OFICIAL, 2 = INVITADO
  foto: string;
  marca?: number; // ← Agregado: campo que usas en el backend
  sancion?: number; // 1 = sancionado, 0 = no sancionado
  listanegra?: number; // 1 = en lista negra, 0 = no está
};

// Para la respuesta del backend
export interface PartidoJugadorResponse {
  success: boolean;
  message: string;
  data?: PartidoJugadorExtendido;
}
