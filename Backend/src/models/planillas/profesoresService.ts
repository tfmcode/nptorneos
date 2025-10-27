// ========================================
// SERVICIO DE PROFESORES - PLANILLAS DE PAGO
// ========================================

import { pool } from "../../config/db";
import { PlanillaProfesor } from "../../types/planillasPago";

/**
 * Obtener profesores de una planilla
 */
export const getProfesoresByPlanilla = async (
  idfecha: number
): Promise<PlanillaProfesor[]> => {
  try {
    const query = `
      SELECT 
        fp.*,
        p.nombre as nombre_profesor
      FROM fechas_profes fp
      LEFT JOIN proveedores p ON fp.idprofesor = p.id
      WHERE fp.idfecha = $1
      ORDER BY fp.orden
    `;
    const { rows } = await pool.query(query, [idfecha]);

    return rows.map((row: any) => ({
      idfecha: row.idfecha,
      orden: row.orden,
      idprofesor: row.idprofesor,
      horas: parseFloat(row.horas || "0"),
      valor_hora: parseFloat(row.valor_hora || "0"),
      total: parseFloat(row.total || "0"),
      fhcarga: row.fhcarga,
      nombre_profesor: row.nombre_profesor,
    }));
  } catch (error) {
    console.error("Error en getProfesoresByPlanilla:", error);
    throw error;
  }
};

/**
 * Agregar profesor
 */
export const addProfesor = async (
  profesor: Omit<PlanillaProfesor, "total" | "fhcarga" | "nombre_profesor">
): Promise<PlanillaProfesor> => {
  try {
    const total = Number(profesor.horas) * Number(profesor.valor_hora);

    const query = `
      INSERT INTO fechas_profes 
        (idfecha, orden, idprofesor, horas, valor_hora, total, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      profesor.idfecha,
      profesor.orden,
      profesor.idprofesor,
      profesor.horas,
      profesor.valor_hora,
      total,
    ]);

    return rows[0];
  } catch (error) {
    console.error("Error en addProfesor:", error);
    throw error;
  }
};

/**
 * Actualizar profesor
 */
export const updateProfesor = async (
  idfecha: number,
  orden: number,
  profesor: Partial<PlanillaProfesor>
): Promise<PlanillaProfesor> => {
  try {
    const getCurrentQuery = `
      SELECT horas, valor_hora, idprofesor
      FROM fechas_profes 
      WHERE idfecha = $1 AND orden = $2
    `;
    const currentResult = await pool.query(getCurrentQuery, [idfecha, orden]);

    if (currentResult.rows.length === 0) {
      throw new Error("Profesor no encontrado");
    }

    const current = currentResult.rows[0];
    const horas = profesor.horas ?? current.horas;
    const valor_hora = profesor.valor_hora ?? current.valor_hora;
    const idprofesor = profesor.idprofesor ?? current.idprofesor;
    const total = Number(horas) * Number(valor_hora);

    const updateQuery = `
      UPDATE fechas_profes 
      SET idprofesor = $1, horas = $2, valor_hora = $3, total = $4
      WHERE idfecha = $5 AND orden = $6
      RETURNING *
    `;

    const { rows } = await pool.query(updateQuery, [
      idprofesor,
      horas,
      valor_hora,
      total,
      idfecha,
      orden,
    ]);

    return rows[0];
  } catch (error) {
    console.error("Error en updateProfesor:", error);
    throw error;
  }
};

/**
 * Eliminar profesor
 */
export const deleteProfesor = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  try {
    const query = `DELETE FROM fechas_profes WHERE idfecha = $1 AND orden = $2`;
    const result = await pool.query(query, [idfecha, orden]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error en deleteProfesor:", error);
    throw error;
  }
};
