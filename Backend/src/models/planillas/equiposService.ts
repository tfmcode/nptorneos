// ========================================
// SERVICIO DE EQUIPOS - PLANILLAS DE PAGO
// ========================================

import { pool } from "../../config/db";
import { PlanillaEquipo } from "../../types/planillasPago";

/**
 * Obtener equipos de una planilla
 */
export const getEquiposByPlanilla = async (
  idfecha: number,
  nombreEquipo1?: string,
  nombreEquipo2?: string
): Promise<PlanillaEquipo[]> => {
  try {
    // ✅ CORREGIDO: Usar p.idfecha en lugar de p.id
    const partidoQuery = `
      SELECT 
        p.idequipo1,
        p.idequipo2,
        e1.nombre as nombre_equipo1,
        e2.nombre as nombre_equipo2
      FROM partidos p
      LEFT JOIN wequipos e1 ON p.idequipo1 = e1.id
      LEFT JOIN wequipos e2 ON p.idequipo2 = e2.id
      WHERE p.idfecha = $1
    `;
    const partidoResult = await pool.query(partidoQuery, [idfecha]);

    if (partidoResult.rows.length === 0) {
      return [];
    }

    const { idequipo1, idequipo2 } = partidoResult.rows[0];
    const nombre1 = nombreEquipo1 || partidoResult.rows[0].nombre_equipo1;
    const nombre2 = nombreEquipo2 || partidoResult.rows[0].nombre_equipo2;

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

    if (equiposResult.rows.length > 0) {
      return equiposResult.rows.map((row: any, index: number) => ({
        idfecha: row.idfecha,
        orden: row.orden,
        idequipo: row.idequipo,
        tipopago: row.tipopago,
        importe: parseFloat(row.importe || "0"),
        iddeposito: row.iddeposito,
        fhcarga: row.fhcarga,
        nombre_equipo: index === 0 ? nombre1 : nombre2,
      }));
    }

    // Si no hay registros, crear estructura por defecto
    const equiposDefault: PlanillaEquipo[] = [
      {
        idfecha,
        orden: 1,
        idequipo: idequipo1,
        tipopago: 1, // Efectivo por defecto
        importe: 0,
        nombre_equipo: nombre1 || "Equipo Local",
      },
      {
        idfecha,
        orden: 2,
        idequipo: idequipo2,
        tipopago: 1,
        importe: 0,
        nombre_equipo: nombre2 || "Equipo Visitante",
      },
    ];

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
