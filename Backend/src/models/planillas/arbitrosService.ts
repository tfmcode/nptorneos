// ========================================
// SERVICIO DE ÁRBITROS - PLANILLAS DE PAGO
// ========================================

import { pool } from "../../config/db";
import { PlanillaArbitro } from "../../types/planillasPago";

/**
 * Obtener árbitros de una planilla
 */
export const getArbitrosByPlanilla = async (
  idfecha: number
): Promise<PlanillaArbitro[]> => {
  try {
    const query = `
      SELECT 
        fa.idfecha,
        fa.orden,
        fa.idarbitro,
        fa.idprofesor,
        fa.partidos,
        fa.valor_partido,
        fa.total,
        fa.fhcarga,
        p.nombre as nombre_arbitro
      FROM fechas_arbitros fa
      LEFT JOIN proveedores p ON fa.idarbitro = p.id
      WHERE fa.idfecha = $1
      ORDER BY fa.orden
    `;

    const { rows } = await pool.query(query, [idfecha]);

    return rows.map((row: any) => ({
      idfecha: row.idfecha,
      orden: row.orden,
      idarbitro: row.idarbitro,
      idprofesor: row.idprofesor,
      partidos: parseFloat(row.partidos || "0"),
      valor_partido: parseFloat(row.valor_partido || "0"),
      total: parseFloat(row.total || "0"),
      fhcarga: row.fhcarga,
      nombre_arbitro: row.nombre_arbitro,
    }));
  } catch (error) {
    console.error("Error en getArbitrosByPlanilla:", error);
    throw error;
  }
};

/**
 * Agregar árbitro
 */
export const addArbitro = async (
  arbitro: Omit<PlanillaArbitro, "total" | "fhcarga" | "nombre_arbitro">
): Promise<PlanillaArbitro> => {
  try {
    const total = Number(arbitro.partidos) * Number(arbitro.valor_partido);

    const query = `
      INSERT INTO fechas_arbitros 
        (idfecha, orden, idarbitro, idprofesor, partidos, valor_partido, total, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (idfecha, orden)
      DO UPDATE SET
        idarbitro = EXCLUDED.idarbitro,
        idprofesor = EXCLUDED.idprofesor,
        partidos = EXCLUDED.partidos,
        valor_partido = EXCLUDED.valor_partido,
        total = EXCLUDED.total
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      arbitro.idfecha,
      arbitro.orden,
      arbitro.idarbitro,
      arbitro.idprofesor || null,
      arbitro.partidos,
      arbitro.valor_partido,
      total,
    ]);

    return rows[0];
  } catch (error) {
    console.error("Error en addArbitro:", error);
    throw error;
  }
};

/**
 * Actualizar árbitro
 */
export const updateArbitro = async (
  idfecha: number,
  orden: number,
  arbitro: Partial<PlanillaArbitro>
): Promise<PlanillaArbitro> => {
  try {
    const getCurrentQuery = `
      SELECT partidos, valor_partido, idarbitro, idprofesor
      FROM fechas_arbitros 
      WHERE idfecha = $1 AND orden = $2
    `;
    const currentResult = await pool.query(getCurrentQuery, [idfecha, orden]);

    if (currentResult.rows.length === 0) {
      throw new Error("Árbitro no encontrado");
    }

    const current = currentResult.rows[0];
    const partidos = arbitro.partidos ?? current.partidos;
    const valor_partido = arbitro.valor_partido ?? current.valor_partido;
    const idarbitro = arbitro.idarbitro ?? current.idarbitro;
    const idprofesor = arbitro.idprofesor ?? current.idprofesor;
    const total = Number(partidos) * Number(valor_partido);

    const updateQuery = `
      UPDATE fechas_arbitros 
      SET idarbitro = $1, idprofesor = $2, partidos = $3, valor_partido = $4, total = $5
      WHERE idfecha = $6 AND orden = $7
      RETURNING *
    `;

    const { rows } = await pool.query(updateQuery, [
      idarbitro,
      idprofesor,
      partidos,
      valor_partido,
      total,
      idfecha,
      orden,
    ]);

    return rows[0];
  } catch (error) {
    console.error("Error en updateArbitro:", error);
    throw error;
  }
};

/**
 * Eliminar árbitro
 */
export const deleteArbitro = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  try {
    const query = `DELETE FROM fechas_arbitros WHERE idfecha = $1 AND orden = $2`;
    const result = await pool.query(query, [idfecha, orden]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error en deleteArbitro:", error);
    throw error;
  }
};
