// ========================================
// SERVICIO DE OTROS GASTOS - PLANILLAS DE PAGO
// ========================================

import { pool } from "../../config/db";
import { PlanillaOtroGasto } from "../../types/planillasPago";

/**
 * Obtener otros gastos de una planilla
 */
export const getOtrosGastosByPlanilla = async (
  idfecha: number
): Promise<PlanillaOtroGasto[]> => {
  try {
    const query = `
      SELECT 
        fo.*,
        NULL as descripcion_gasto
      FROM fechas_otros fo
      WHERE fo.idfecha = $1
      ORDER BY fo.orden
    `;
    const { rows } = await pool.query(query, [idfecha]);

    return rows.map((row: any) => ({
      idfecha: row.idfecha,
      orden: row.orden,
      codgasto: row.codgasto,
      idprofesor: row.idprofesor,
      cantidad: parseFloat(row.cantidad || "0"),
      valor_unidad: parseFloat(row.valor_unidad || "0"),
      total: parseFloat(row.total || "0"),
      fhcarga: row.fhcarga,
      descripcion_gasto: row.descripcion_gasto,
    }));
  } catch (error) {
    console.error("Error en getOtrosGastosByPlanilla:", error);
    throw error;
  }
};

/**
 * Agregar otro gasto
 */
export const addOtroGasto = async (
  gasto: Omit<PlanillaOtroGasto, "total" | "fhcarga" | "descripcion_gasto">
): Promise<PlanillaOtroGasto> => {
  try {
    const total = Number(gasto.cantidad) * Number(gasto.valor_unidad);

    const query = `
      INSERT INTO fechas_otros 
        (idfecha, orden, codgasto, idprofesor, cantidad, valor_unidad, total, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      gasto.idfecha,
      gasto.orden,
      gasto.codgasto,
      gasto.idprofesor || null,
      gasto.cantidad,
      gasto.valor_unidad,
      total,
    ]);

    return rows[0];
  } catch (error) {
    console.error("Error en addOtroGasto:", error);
    throw error;
  }
};

/**
 * Actualizar otro gasto
 */
export const updateOtroGasto = async (
  idfecha: number,
  orden: number,
  gasto: Partial<PlanillaOtroGasto>
): Promise<PlanillaOtroGasto> => {
  try {
    const getCurrentQuery = `
      SELECT cantidad, valor_unidad, codgasto, idprofesor
      FROM fechas_otros 
      WHERE idfecha = $1 AND orden = $2
    `;
    const currentResult = await pool.query(getCurrentQuery, [idfecha, orden]);

    if (currentResult.rows.length === 0) {
      throw new Error("Gasto no encontrado");
    }

    const current = currentResult.rows[0];
    const cantidad = gasto.cantidad ?? current.cantidad;
    const valor_unidad = gasto.valor_unidad ?? current.valor_unidad;
    const codgasto = gasto.codgasto ?? current.codgasto;
    const idprofesor = gasto.idprofesor ?? current.idprofesor;
    const total = Number(cantidad) * Number(valor_unidad);

    const updateQuery = `
      UPDATE fechas_otros 
      SET codgasto = $1, idprofesor = $2, cantidad = $3, valor_unidad = $4, total = $5
      WHERE idfecha = $6 AND orden = $7
      RETURNING *
    `;

    const { rows } = await pool.query(updateQuery, [
      codgasto,
      idprofesor,
      cantidad,
      valor_unidad,
      total,
      idfecha,
      orden,
    ]);

    return rows[0];
  } catch (error) {
    console.error("Error en updateOtroGasto:", error);
    throw error;
  }
};

/**
 * Eliminar otro gasto
 */
export const deleteOtroGasto = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  try {
    const query = `DELETE FROM fechas_otros WHERE idfecha = $1 AND orden = $2`;
    const result = await pool.query(query, [idfecha, orden]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error en deleteOtroGasto:", error);
    throw error;
  }
};
