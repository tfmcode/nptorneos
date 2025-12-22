// ========================================
// SERVICIO DE EQUIPOS - PLANILLAS DE PAGO
// ========================================

import { pool } from "../../config/db";
import { PlanillaEquipo } from "../../types/planillasPago";

/**
 * Obtener equipos de una planilla
 */
export const getEquiposByPlanilla = async (
  idfecha: number
): Promise<PlanillaEquipo[]> => {
  try {
    // ✅ NUEVA LÓGICA: Obtener TODOS los partidos de la caja
    const partidosQuery = `
      SELECT
        p.id as partido_id,
        p.idequipo1,
        p.idequipo2,
        e1.nombre as nombre_equipo1,
        e2.nombre as nombre_equipo2
      FROM partidos p
      LEFT JOIN wequipos e1 ON p.idequipo1 = e1.id
      LEFT JOIN wequipos e2 ON p.idequipo2 = e2.id
      WHERE p.idfecha = $1
      ORDER BY p.id
    `;
    const partidosResult = await pool.query(partidosQuery, [idfecha]);

    if (partidosResult.rows.length === 0) {
      return [];
    }

    // Verificar si existe la planilla en wtorneos_fechas
    const planillaQuery = `SELECT id FROM wtorneos_fechas WHERE id = $1`;
    const planillaResult = await pool.query(planillaQuery, [idfecha]);

    if (planillaResult.rows.length === 0) {
      return [];
    }

    // Buscar registros de pago en wfechas_equipos
    const equiposQuery = `
      SELECT * FROM wfechas_equipos
      WHERE idfecha = $1
      ORDER BY orden
    `;
    const equiposResult = await pool.query(equiposQuery, [idfecha]);

    // Crear un mapa de todos los equipos únicos de todos los partidos
    const equiposMap = new Map<number, string>();
    partidosResult.rows.forEach((partido: any) => {
      if (partido.idequipo1) {
        equiposMap.set(partido.idequipo1, partido.nombre_equipo1 || `Equipo ${partido.idequipo1}`);
      }
      if (partido.idequipo2) {
        equiposMap.set(partido.idequipo2, partido.nombre_equipo2 || `Equipo ${partido.idequipo2}`);
      }
    });

    // Si ya existen registros en wfechas_equipos, usarlos
    if (equiposResult.rows.length > 0) {
      return equiposResult.rows.map((row: any) => ({
        idfecha: row.idfecha,
        orden: row.orden,
        idequipo: row.idequipo,
        tipopago: row.tipopago,
        importe: parseFloat(row.importe || "0"),
        iddeposito: row.iddeposito,
        fhcarga: row.fhcarga,
        nombre_equipo: equiposMap.get(row.idequipo) || `Equipo ${row.idequipo}`,
      }));
    }

    // Si no hay registros, crear estructura por defecto con TODOS los equipos
    const equiposDefault: PlanillaEquipo[] = [];
    let orden = 1;

    equiposMap.forEach((nombre, idequipo) => {
      equiposDefault.push({
        idfecha,
        orden: orden++,
        idequipo,
        tipopago: 1, // Efectivo por defecto
        importe: 0,
        nombre_equipo: nombre,
      });
    });

    return equiposDefault;
  } catch (error) {
    console.error("Error en getEquiposByPlanilla:", error);
    throw error;
  }
};

/**
 * Agregar o actualizar equipo
 */
export const addEquipo = async (
  equipo: Omit<PlanillaEquipo, "nombre_equipo">
): Promise<PlanillaEquipo> => {
  try {
    const query = `
      INSERT INTO wfechas_equipos 
        (idfecha, orden, idequipo, tipopago, importe, iddeposito, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (idfecha, orden) 
      DO UPDATE SET 
        idequipo = EXCLUDED.idequipo,
        tipopago = EXCLUDED.tipopago,
        importe = EXCLUDED.importe,
        iddeposito = EXCLUDED.iddeposito
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      equipo.idfecha,
      equipo.orden,
      equipo.idequipo,
      equipo.tipopago,
      equipo.importe,
      equipo.iddeposito || null,
    ]);

    return rows[0];
  } catch (error) {
    console.error("Error en addEquipo:", error);
    throw error;
  }
};

/**
 * Actualizar equipo existente
 */
export const updateEquipo = async (
  idfecha: number,
  orden: number,
  equipo: Partial<PlanillaEquipo>
): Promise<PlanillaEquipo> => {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (equipo.tipopago !== undefined) {
      updates.push(`tipopago = $${index}`);
      values.push(equipo.tipopago);
      index++;
    }

    if (equipo.importe !== undefined) {
      updates.push(`importe = $${index}`);
      values.push(equipo.importe);
      index++;
    }

    if (equipo.iddeposito !== undefined) {
      updates.push(`iddeposito = $${index}`);
      values.push(equipo.iddeposito);
      index++;
    }

    if (updates.length === 0) {
      throw new Error("No hay datos para actualizar.");
    }

    values.push(idfecha);
    values.push(orden);

    const query = `
      UPDATE wfechas_equipos 
      SET ${updates.join(", ")}
      WHERE idfecha = $${index} AND orden = $${index + 1}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      throw new Error("Equipo no encontrado");
    }

    return rows[0];
  } catch (error) {
    console.error("Error en updateEquipo:", error);
    throw error;
  }
};

/**
 * Eliminar equipo
 */
export const deleteEquipo = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  try {
    const deleteQuery = `
      DELETE FROM wfechas_equipos 
      WHERE idfecha = $1 AND orden = $2
    `;
    const result = await pool.query(deleteQuery, [idfecha, orden]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error en deleteEquipo:", error);
    throw error;
  }
};
