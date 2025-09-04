export interface Partido {
  id?: number;
  codtipo: number;
  idequipo1: number;
  nombre1?: string;
  idequipo2: number;
  nombre2?: string;
  idzona: number;
  goles1?: number;
  goles2?: number;
  codestado: number;
  fecha?: string;
  nrofecha?: number;
  observaciones?: string;
  estadio?: string;
  incidencias?: string;
  arbitro?: string;
  puntobonus1?: number;
  puntobonus2?: number;
  formacion1?: string;
  formacion2?: string;
  cambios1?: string;
  cambios2?: string;
  dt1?: string;
  dt2?: string;
  suplentes1?: string;
  suplentes2?: string;
  idsede?: number;
  sede?: string;
  fhcarga?: string;
  fhbaja?: string;
  idusuario?: number;
  idprofesor?: number;
  ausente1?: number;
  ausente2?: number;
  idfecha?: number;
  horario?: string;
  [key: string]: unknown;
}

export interface PartidoInput {
  idzona: number;
  nrofecha: number;
  fecha: string;
  horario: string;
  idsede: number;
  codtipo: number;
  idequipo1: number;
  idequipo2: number;
  nrofecha: number;
}
