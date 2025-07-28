export interface Fecha {
  id?: number;
  fecha: string;
  idsede: number;
  idsubsede: number;
  idtorneo: number;
  codfecha: number;
  idturno: number;
  idprofesor?: number;
  observ?: string;
  fhcierre?: string | null;
  fhcierrecaja?: string | null;
  fhbaja?: string | null;
  fhcarga?: string | null;
  fhultmod?: string | null;
  [key: string]: unknown;
}

export interface FechaResumen {
  id: number;
  txfecha: string;
  sede: string;
  subsede: string;
  torneo: string;
  ftorneo: string;
  turno: string;
  cierre: "S" | "N";
  cierrecaja: "S" | "N";
  txfhcierrecaja: string;
  [key: string]: unknown;
}

export type FechaInput = Omit<Fecha, "id" | "fhbaja" | "fhcarga" | "fhultmod">;
