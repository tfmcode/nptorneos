import { Torneo } from "./torneos";

export interface MenuTorneo {
  idopcion?: number;
  idtorneo?: number;
  torneo?: Torneo; 
  descripcion?: string | null;
  orden?: number | null;
  [key: string]: unknown;
}

export interface MenuTorneoInput {
  idopcion: number;
  idtorneo?: number;
  torneo?: Torneo; 
  descripcion?: string | null;
  orden?: number | null;
  ordenAnterior?: number; 
  [key: string]: unknown;
}