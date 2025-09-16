export interface TorneosEquiposInsc {
  id?: number;
  idtorneo?: number;
  idequipo?: number;
  inscrip?: number;
  deposito?: number;
  fhcarga?: string;
  ivainscrip?: number;
  ivadeposito?: number;
  idpartido?: number;
  torneo_nombre?: string;
  equipo_nombre?: string;
  [key: string]: unknown;
}

export type TorneosEquiposInscInput = Omit<
  TorneosEquiposInsc,
  "id" | "fhcarga" | "torneo_nombre" | "equipo_nombre"
>;

export interface TorneosEquiposInscResponse {
  inscripciones: TorneosEquiposInsc[];
  total: number;
  page?: number;
  limit?: number;
}
