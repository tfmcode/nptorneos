export interface FichaPartido {
  idpartido: number;
  fecha: string;
  horario: string;
  estado: string;
  sede: string;
  equipo1: {
    id: number;
    nombre: string;
    escudo?: string;
    goles: number;
    jugadores: JugadorFicha[];
  };
  equipo2: {
    id: number;
    nombre: string;
    escudo?: string;
    goles: number;
    jugadores: JugadorFicha[];
  };
}

export interface JugadorFicha {
  idjugador: number;
  nombre: string;
  goles: number;
  amarillas: number;
  azules: number;
  rojas: number;
  foto?: string;
}
