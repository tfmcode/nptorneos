// ========================================
// UTILIDADES - PLANILLAS DE PAGO
// ========================================

import {
  PlanillaEquipo,
  PlanillaArbitro,
  PlanillaCancha,
  PlanillaProfesor,
  PlanillaMedico,
  PlanillaOtroGasto,
  TotalesPlanilla,
} from "../../types/planillasPago";

/**
 * Calcular totales de una planilla
 * ✅ ACTUALIZADO: Usa pago_ins, pago_dep, pago_fecha de la nueva estructura
 */
export const calcularTotales = (
  equipos: PlanillaEquipo[],
  arbitros: PlanillaArbitro[],
  canchas: PlanillaCancha[],
  profesores: PlanillaProfesor[],
  medico: PlanillaMedico[],
  otros_gastos: PlanillaOtroGasto[]
): TotalesPlanilla => {
  // ========================================
  // INGRESOS
  // ========================================

  // ✅ CORREGIDO: Usar los nuevos campos pago_ins, pago_dep, pago_fecha
  const ingreso_inscripciones = equipos
    .filter((e) => e.ausente === 0) // Solo equipos presentes
    .reduce((sum, e) => sum + (e.pago_ins || 0), 0);

  const ingreso_depositos = equipos
    .filter((e) => e.ausente === 0) // Solo equipos presentes
    .reduce((sum, e) => sum + (e.pago_dep || 0), 0);

  const ingreso_fecha = equipos
    .filter((e) => e.ausente === 0) // Solo equipos presentes
    .reduce((sum, e) => sum + (e.pago_fecha || 0), 0);

  const total_ingresos =
    ingreso_inscripciones + ingreso_depositos + ingreso_fecha;

  // ========================================
  // EGRESOS
  // ========================================

  const egreso_arbitros = arbitros.reduce((sum, a) => sum + (a.total || 0), 0);
  const egreso_canchas = canchas.reduce((sum, c) => sum + (c.total || 0), 0);
  const egreso_profesores = profesores.reduce(
    (sum, p) => sum + (p.total || 0),
    0
  );
  const egreso_medico = medico.reduce((sum, m) => sum + (m.total || 0), 0);
  const egreso_otros = otros_gastos.reduce((sum, g) => sum + (g.total || 0), 0);

  const total_egresos =
    egreso_arbitros +
    egreso_canchas +
    egreso_profesores +
    egreso_medico +
    egreso_otros;

  // ========================================
  // TOTALES FINALES
  // ========================================

  // Total Caja = Todos los ingresos - Todos los egresos
  const total_caja = total_ingresos - total_egresos;

  // ✅ CORREGIDO: Total Efectivo = Solo inscripciones (efectivo) - egresos
  // Los depósitos y pagos de fecha pueden incluir transferencias/MP
  const total_efectivo = ingreso_inscripciones - total_egresos;

  // ✅ CORREGIDO: Diferencia = Total Caja - Total Efectivo
  // Esto muestra cuánto hay en transferencias/MP/etc
  const diferencia_caja = total_caja - total_efectivo;

  return {
    ingreso_inscripciones,
    ingreso_depositos,
    ingreso_fecha,
    total_ingresos,
    egreso_arbitros,
    egreso_canchas,
    egreso_profesores,
    egreso_medico,
    egreso_otros,
    total_egresos,
    total_caja,
    total_efectivo,
    diferencia_caja,
  };
};

/**
 * Formatear totales para mejor legibilidad
 */
export const formatearTotales = (totales: TotalesPlanilla): TotalesPlanilla => {
  return {
    ingreso_inscripciones: Number(totales.ingreso_inscripciones.toFixed(2)),
    ingreso_depositos: Number(totales.ingreso_depositos.toFixed(2)),
    ingreso_fecha: Number(totales.ingreso_fecha.toFixed(2)),
    total_ingresos: Number(totales.total_ingresos.toFixed(2)),
    egreso_arbitros: Number(totales.egreso_arbitros.toFixed(2)),
    egreso_canchas: Number(totales.egreso_canchas.toFixed(2)),
    egreso_profesores: Number(totales.egreso_profesores.toFixed(2)),
    egreso_medico: Number(totales.egreso_medico.toFixed(2)),
    egreso_otros: Number(totales.egreso_otros.toFixed(2)),
    total_egresos: Number(totales.total_egresos.toFixed(2)),
    total_caja: Number(totales.total_caja.toFixed(2)),
    total_efectivo: Number(totales.total_efectivo.toFixed(2)),
    diferencia_caja: Number(totales.diferencia_caja.toFixed(2)),
  };
};

/**
 * Validar si una planilla está cerrada
 */
export const isPlanillaCerrada = (fhcierre: Date | null): boolean => {
  return fhcierre !== null;
};

/**
 * Validar si una planilla está contabilizada
 */
export const isPlanillaContabilizada = (fhcierrecaja: Date | null): boolean => {
  return fhcierrecaja !== null;
};

/**
 * Obtener estado de la planilla
 */
export const getEstadoPlanilla = (
  fhcierre: Date | null,
  fhcierrecaja: Date | null
): "abierta" | "cerrada" | "contabilizada" => {
  if (fhcierrecaja !== null) return "contabilizada";
  if (fhcierre !== null) return "cerrada";
  return "abierta";
};
