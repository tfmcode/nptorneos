export type PartidoJugadorBase = {
  idpartido: number;
  idequipo: number;
  idjugador: number;
  goles: number;
  camiseta: string;
  amarilla: number; // ✅ Corregido nombre del campo
  azul: number;
  roja: number; // ✅ Corregido nombre del campo
};

export type PartidoJugador = PartidoJugadorBase & {
  jugo: boolean;
};

// ✅ CORREGIDO: Interface actualizada con campos consistentes
export interface PartidoJugadorInput {
  idjugador: number;
  jugo: boolean; // ✅ Agregado campo jugo
  camiseta: string;
  goles: number;
  amarilla: number; // ✅ Corregido nombre (era amarilla, no amarillo)
  azul: number;
  roja: number; // ✅ Corregido nombre (era roja, no rojo)
  fhcarga?: string;
  idusuario?: number;
}

// ✅ CORREGIDO: Interface extendida con todos los campos necesarios
export type PartidoJugadorExtendido = PartidoJugador & {
  nombre: string;
  docnro: number;
  codtipo: number; // 1 = OFICIAL, 2 = INVITADO
  foto: string;
  marca?: number; // 1 = está en el partido, 0 = no está
  sancion?: number; // 1 = sancionado, 0 = no sancionado
  listanegra?: number; // 1 = en lista negra, 0 = no está
};

// Para la respuesta del backend
export interface PartidoJugadorResponse {
  success: boolean;
  message: string;
  data?: PartidoJugadorExtendido;
}
