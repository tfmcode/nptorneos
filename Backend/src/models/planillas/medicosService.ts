// ========================================
// SERVICIO DE MÉDICOS - PLANILLAS DE PAGO
// ========================================

import { pool } from "../../config/db";
import { PlanillaMedico } from "../../types/planillasPago";

/**
 * Obtener médicos de una planilla
 */
export const getMedicoByPlanilla = async (
  idfecha: number
): Promise<PlanillaMedico[]> => {
  try {
    const query = `
      SELECT 
        fm.*,
        p.nombre as nombre_medico
      FROM fechas_medico fm
      LEFT JOIN proveedores p ON fm.idmedico = p.id
      WHERE fm.idfecha = $1
      ORDER BY fm.orden
    `;
    const { rows } = await pool.query(query, [idfecha]);

    return rows.map((row: any) => ({
      idfecha: row.idfecha,
      orden: row.orden,
      idmedico: row.idmedico,
      horas: parseFloat(row.horas || "0"),
      valor_hora: parseFloat(row.valor_hora || "0"),
      total: parseFloat(row.total || "0"),
      fhcarga: row.fhcarga,
      nombre_medico: row.nombre_medico,
    }));
  } catch (error) {
    console.error("Error en getMedicoByPlanilla:", error);
    throw error;
  }
};

/**
 * Agregar médico
 */
export const addMedico = async (
  medico: Omit<PlanillaMedico, "total" | "fhcarga" | "nombre_medico">
): Promise<PlanillaMedico> => {
  try {
    const total = Number(medico.horas) * Number(medico.valor_hora);

    const query = `
      INSERT INTO fechas_medico 
        (idfecha, orden, idmedico, horas, valor_hora, total, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      medico.idfecha,
      medico.orden,
      medico.idmedico,
      medico.horas,
      medico.valor_hora,
      total,
    ]);

    return rows[0];
  } catch (error) {
    console.error("Error en addMedico:", error);
    throw error;
  }
};

/**
 * Actualizar médico
 */
export const updateMedico = async (
  idfecha: number,
  orden: number,
  medico: Partial<PlanillaMedico>
): Promise<PlanillaMedico> => {
  try {
    const getCurrentQuery = `
      SELECT horas, valor_hora, idmedico
      FROM fechas_medico 
      WHERE idfecha = $1 AND orden = $2
    `;
    const currentResult = await pool.query(getCurrentQuery, [idfecha, orden]);

    if (currentResult.rows.length === 0) {
      throw new Error("Médico no encontrado");
    }

    const current = currentResult.rows[0];
    const horas = medico.horas ?? current.horas;
    const valor_hora = medico.valor_hora ?? current.valor_hora;
    const idmedico = medico.idmedico ?? current.idmedico;
    const total = Number(horas) * Number(valor_hora);

    const updateQuery = `
      UPDATE fechas_medico 
      SET idmedico = $1, horas = $2, valor_hora = $3, total = $4
      WHERE idfecha = $5 AND orden = $6
      RETURNING *
    `;

    const { rows } = await pool.query(updateQuery, [
      idmedico,
      horas,
      valor_hora,
      total,
      idfecha,
      orden,
    ]);

    return rows[0];
  } catch (error) {
    console.error("Error en updateMedico:", error);
    throw error;
  }
};

/**
 * Eliminar médico
 */
export const deleteMedico = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  try {
    const query = `DELETE FROM fechas_medico WHERE idfecha = $1 AND orden = $2`;
    const result = await pool.query(query, [idfecha, orden]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error en deleteMedico:", error);
    throw error;
  }
};
