// ========================================
// SERVICIO DE CANCHAS - PLANILLAS DE PAGO
// ========================================

import { pool } from "../../config/db";
import { PlanillaCancha } from "../../types/planillasPago";

/**
 * Obtener canchas de una planilla
 */
export const getCanchasByPlanilla = async (
  idfecha: number
): Promise<PlanillaCancha[]> => {
  try {
    const query = `
      SELECT * FROM fechas_canchas 
      WHERE idfecha = $1 
      ORDER BY orden
    `;
    const { rows } = await pool.query(query, [idfecha]);

    return rows.map((row: any) => ({
      idfecha: row.idfecha,
      orden: row.orden,
      horas: parseFloat(row.horas || "0"),
      valor_hora: parseFloat(row.valor_hora || "0"),
      total: parseFloat(row.total || "0"),
      fhcarga: row.fhcarga,
    }));
  } catch (error) {
    console.error("Error en getCanchasByPlanilla:", error);
    throw error;
  }
};

/**
 * Agregar cancha
 */
export const addCancha = async (
  cancha: Omit<PlanillaCancha, "total" | "fhcarga">
): Promise<PlanillaCancha> => {
  try {
    const total = Number(cancha.horas) * Number(cancha.valor_hora);

    const query = `
      INSERT INTO fechas_canchas 
        (idfecha, orden, horas, valor_hora, total, fhcarga)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      cancha.idfecha,
      cancha.orden,
      cancha.horas,
      cancha.valor_hora,
      total,
    ]);

    return rows[0];
  } catch (error) {
    console.error("Error en addCancha:", error);
    throw error;
  }
};

/**
 * Actualizar cancha
 */
export const updateCancha = async (
  idfecha: number,
  orden: number,
  cancha: Partial<PlanillaCancha>
): Promise<PlanillaCancha> => {
  try {
    const getCurrentQuery = `
      SELECT horas, valor_hora 
      FROM fechas_canchas 
      WHERE idfecha = $1 AND orden = $2
    `;
    const currentResult = await pool.query(getCurrentQuery, [idfecha, orden]);

    if (currentResult.rows.length === 0) {
      throw new Error("Cancha no encontrada");
    }

    const current = currentResult.rows[0];
    const horas = cancha.horas ?? current.horas;
    const valor_hora = cancha.valor_hora ?? current.valor_hora;
    const total = Number(horas) * Number(valor_hora);

    const updateQuery = `
      UPDATE fechas_canchas 
      SET horas = $1, valor_hora = $2, total = $3
      WHERE idfecha = $4 AND orden = $5
      RETURNING *
    `;

    const { rows } = await pool.query(updateQuery, [
      horas,
      valor_hora,
      total,
      idfecha,
      orden,
    ]);

    return rows[0];
  } catch (error) {
    console.error("Error en updateCancha:", error);
    throw error;
  }
};

/**
 * Eliminar cancha
 */
export const deleteCancha = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  try {
    const query = `DELETE FROM fechas_canchas WHERE idfecha = $1 AND orden = $2`;
    const result = await pool.query(query, [idfecha, orden]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error en deleteCancha:", error);
    throw error;
  }
};
