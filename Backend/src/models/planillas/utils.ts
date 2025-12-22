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
 */
export const calcularTotales = (
  equipos: PlanillaEquipo[],
  arbitros: PlanillaArbitro[],
  canchas: PlanillaCancha[],
  profesores: PlanillaProfesor[],
  medico: PlanillaMedico[],
  otros_gastos: PlanillaOtroGasto[]
): TotalesPlanilla => {
  // INGRESOS
  const ingreso_inscripciones = equipos
    .filter((e) => e.tipopago === 1)
    .reduce((sum, e) => sum + (e.importe || 0), 0);

  const ingreso_depositos = equipos
    .filter((e) => e.tipopago === 2)
    .reduce((sum, e) => sum + (e.importe || 0), 0);

  const ingreso_fecha = equipos
    .filter((e) => e.tipopago === 3)
    .reduce((sum, e) => sum + (e.importe || 0), 0);

  const total_ingresos =
    ingreso_inscripciones + ingreso_depositos + ingreso_fecha;

  // EGRESOS
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

  // TOTALES FINALES
  const total_caja = total_ingresos - total_egresos;
  // ✅ CORREGIDO: Total efectivo = solo ingresos en efectivo (tipopago=1) menos egresos
  const total_efectivo = ingreso_inscripciones - total_egresos;
  const diferencia_caja = total_efectivo - total_caja;

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
