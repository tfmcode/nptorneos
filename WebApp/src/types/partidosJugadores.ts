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

export type PartidoJugadorInput = {
  idjugador: number;
  jugo: boolean;
  camiseta: string;
  goles: number;
  amarilla: number;
  azul: number;
  roja: number;
};

export type PartidoJugadorExtendido = PartidoJugador & {
  nombre: string;
  docnro: string;
  tipo: number;
  foto: string;
  sancion?: number;
  listanegra?: number;
};
