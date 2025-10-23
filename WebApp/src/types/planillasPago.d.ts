export interface PlanillaPago {
  id?: number;
  idfecha: number;
  fecha: string;
  idsede: number;
  idsubsede?: number;
  idtorneo: number;
  codfecha?: number;
  idprofesor?: number;
  idprofesor_cierre?: number;
  idturno?: number;
  observ?: string;
  observ_caja?: string;
  fhcarga?: string;
  fhbaja?: string;
  fhcierre?: string;
  fhcierrecaja?: string;
  idusrcierrecaja?: number;
  totcierre?: number;
  totefectivo?: number;
  total_ingresos?: number;
  total_egresos?: number;
  total_caja?: number;
  diferencia_caja?: number;
  sede_nombre?: string;
  subsede_nombre?: string;
  torneo_nombre?: string;
  profesor_nombre?: string;
  [key: string]: unknown;
}

export interface PlanillaEquipo {
  id?: number;
  idfecha: number;
  orden: number;
  idequipo: number;
  tipopago: number;
  importe: number;
  iddeposito?: number;
  fhcarga?: string;
  nombre_equipo?: string;
  [key: string]: unknown;
}

export interface PlanillaArbitro {
  id?: number;
  idfecha: number;
  orden: number;
  idarbitro: number;
  idprofesor?: number;
  partidos: number;
  valor_partido: number;
  total: number;
  fhcarga?: string;
  nombre_arbitro?: string;
  [key: string]: unknown;
}

export interface PlanillaCancha {
  id?: number;
  idfecha: number;
  orden: number;
  horas: number;
  valor_hora: number;
  total: number;
  fhcarga?: string;
  [key: string]: unknown;
}

export interface PlanillaProfesor {
  id?: number;
  idfecha: number;
  orden: number;
  idprofesor: number;
  horas: number;
  valor_hora: number;
  total: number;
  fhcarga?: string;
  nombre_profesor?: string;
  [key: string]: unknown;
}

export interface PlanillaMedico {
  id?: number;
  idfecha: number;
  orden: number;
  idmedico: number;
  horas: number;
  valor_hora: number;
  total: number;
  fhcarga?: string;
  nombre_medico?: string;
  [key: string]: unknown;
}

export interface PlanillaOtroGasto {
  id?: number;
  idfecha: number;
  orden: number;
  codgasto: number;
  idprofesor?: number;
  cantidad: number;
  valor_unidad: number;
  total: number;
  fhcarga?: string;
  descripcion_gasto?: string;
  [key: string]: unknown;
}

export interface PlanillaPagoInput {
  idfecha: number;
  fecha: string;
  idsede: number;
  idsubsede?: number;
  idtorneo: number;
  codfecha?: number;
  idprofesor?: number;
  idturno?: number;
  observ?: string;
}

export interface PlanillaEquipoInput {
  idfecha: number;
  orden: number;
  idequipo: number;
  tipopago: number;
  importe: number;
  iddeposito?: number;
}

export interface PlanillaArbitroInput {
  idfecha: number;
  orden: number;
  idarbitro: number;
  idprofesor?: number;
  partidos: number;
  valor_partido: number;
}

export interface PlanillaCanchaInput {
  idfecha: number;
  orden: number;
  horas: number;
  valor_hora: number;
}

export interface PlanillaProfesorInput {
  idfecha: number;
  orden: number;
  idprofesor: number;
  horas: number;
  valor_hora: number;
}

export interface PlanillaMedicoInput {
  idfecha: number;
  orden: number;
  idmedico: number;
  horas: number;
  valor_hora: number;
}

export interface PlanillaOtroGastoInput {
  idfecha: number;
  orden: number;
  codgasto: number;
  idprofesor?: number;
  cantidad: number;
  valor_unidad: number;
}

export interface PlanillaCompleta {
  planilla: PlanillaPago;
  equipos: PlanillaEquipo[];
  arbitros: PlanillaArbitro[];
  canchas: PlanillaCancha[];
  profesores: PlanillaProfesor[];
  medico: PlanillaMedico[];
  otros_gastos: PlanillaOtroGasto[];
  totales: {
    ingreso_inscripciones: number;
    ingreso_depositos: number;
    ingreso_fecha: number;
    total_ingresos: number;
    egreso_arbitros: number;
    egreso_canchas: number;
    egreso_profesores: number;
    egreso_medico: number;
    egreso_otros: number;
    total_egresos: number;
    total_caja: number;
    total_efectivo: number;
    diferencia_caja: number;
  };
}

export interface PlanillasFiltros {
  idtorneo?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  idsede?: number;
  estado?: "abierta" | "cerrada" | "contabilizada";
}
