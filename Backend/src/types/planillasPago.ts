export interface PlanillaPago {
  id?: number;
  idfecha: number; // Referencia a partidos.id
  fecha: string;
  idsede: number;
  sede_nombre?: string;
  idsubsede?: number;
  idtorneo: number;
  codfecha?: number;
  idprofesor?: number;
  profesor_nombre?: string; // ✅ NUEVO: Nombre del profesor desde proveedores
  idprofesor_cierre?: number;
  profesor_cierre_nombre?: string; // ✅ NUEVO: Nombre del profesor que cerró
  idturno?: number;
  turno_nombre?: string; // ✅ NUEVO: Nombre del turno desde codificadores
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
  torneo?: string;
  torneo_nombre?: string;
  zona?: string;
  zona_nombre?: string;
  estado?: "abierta" | "cerrada" | "contabilizada";
  cantidad_partidos?: number; // ✅ Cantidad de partidos en la caja
  [key: string]: unknown;
}

// Equipos en la planilla
export interface PlanillaEquipo {
  id?: number;
  idfecha: number;
  orden: number;
  idequipo: number;
  tipopago: number; // Inscripción, Depósito, Fecha
  importe: number;
  iddeposito?: number;
  fhcarga?: string;
  // Datos extendidos
  nombre_equipo?: string;
  [key: string]: unknown;
}

// Árbitros
export interface PlanillaArbitro {
  idfecha: number;
  orden: number;
  idarbitro: number;
  idprofesor?: number;
  partidos: number;
  valor_partido: number;
  total: number;
  fhcarga?: string;
  // Datos extendidos
  nombre_arbitro?: string;
  [key: string]: unknown;
}

// Canchas
export interface PlanillaCancha {
  idfecha: number;
  orden: number;
  horas: number;
  valor_hora: number;
  total: number;
  fhcarga?: string;
  [key: string]: unknown;
}

// Profesores
export interface PlanillaProfesor {
  idfecha: number;
  orden: number;
  idprofesor: number;
  horas: number;
  valor_hora: number;
  total: number;
  fhcarga?: string;
  // Datos extendidos
  nombre_profesor?: string;
  [key: string]: unknown;
}

// Servicio Médico
export interface PlanillaMedico {
  idfecha: number;
  orden: number;
  idmedico: number;
  horas: number;
  valor_hora: number;
  total: number;
  fhcarga?: string;
  // Datos extendidos
  nombre_medico?: string;
  [key: string]: unknown;
}

// Otros Gastos
export interface PlanillaOtroGasto {
  idfecha: number;
  orden: number;
  codgasto: number;
  idprofesor?: number;
  cantidad: number;
  valor_unidad: number;
  total: number;
  fhcarga?: string;
  // Datos extendidos
  descripcion_gasto?: string;
  [key: string]: unknown;
}

export interface TotalesPlanilla {
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
  totales: TotalesPlanilla;
}

export interface PlanillaPagoListado {
  id?: number;
  fecha: string;
  sede: string;
  subsede?: string;
  torneo: string;
  profesor?: string;
  estado: "abierta" | "cerrada" | "contabilizada";
  total_caja?: number;
  [key: string]: unknown;
}

export interface PlanillasFiltros {
  idtorneo?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  idsede?: number;
  estado?: "abierta" | "cerrada" | "contabilizada";
}
