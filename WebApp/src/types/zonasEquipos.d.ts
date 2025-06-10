export interface ZonaEquipo {
  id?: number;
  idtorneo: number;
  idzona: number;
  idequipo: number;
  codestado: number;
  fhcarga?: string;
  fhbaja?: string;
  idusuario: number;
  valor_insc?: number;
  valor_fecha?: number;
  nombre?: string;
  abrev?: string;
  [key: string]: unknown;
}

export interface ZonaEquipoInput {
  idzona: number;
  nombre?: string;
  valor_insc?: number;
  valor_fecha?: number;
}
