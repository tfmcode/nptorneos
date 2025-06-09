export interface Torneo {
  id?: number
  nombre: string
  abrev: string
  anio: number
  idcampeonato: number
  idsede: number
  codestado: number
  codtipoestado: number
  cposicion: number
  cpromedio: number
  codmodelo: number
  codtipo: number
  cantmin: number
  torneodefault: number
  fotojugador: number
  idpadre?: number
  idgaleria?: number
  valor_insc?: number
  valor_fecha?: number
  individual: number
  valor_arbitro?: number
  valor_cancha?: number
  valor_medico?: number
  excluir_res: number
  fhcarga?: string
  fhbaja?: string
  idusuario: number
  sas: number
  [key: string]: unknown
}

export interface TorneoInput {
  nombre: string
  abrev: string
  anio: number
  idcampeonato: number
  idsede: number
  codestado: number
  codtipoestado: number
  cposicion: number
  codmodelo: number
  codtipo: number
  cantmin: number
  torneodefault: number
  fotojugador: number
  idpadre?: number
  idgaleria?: number
  valor_insc?: number
  valor_fecha?: number
  individual: number
  valor_arbitro?: number
  valor_cancha?: number
  valor_medico?: number
  excluir_res: number
  fhcarga?: string
  fhbaja?: string
  idusuario: number
  sas: number
}
