// ========================================
// PLANILLAS DE PAGO MODEL - CORREGIDO CON SEDES
// ========================================

import { pool } from "../config/db";
import {
  PlanillaPago,
  PlanillaEquipo,
  PlanillaArbitro,
  PlanillaCancha,
  PlanillaProfesor,
  PlanillaMedico,
  PlanillaOtroGasto,
  PlanillaCompleta,
  PlanillasFiltros,
} from "../types/planillasPago";

// ========================================
// LISTADO DE PLANILLAS CON FILTROS
// ========================================
export const getPlanillasByFiltros = async (
  filtros: PlanillasFiltros
): Promise<PlanillaPago[]> => {
  try {
    let query = `
      SELECT DISTINCT ON (p.id)
        p.id as partido_id,
        p.fecha,
        p.idsede,
        s.nombre as sede_nombre,
        z.idtorneo,
        p.nrofecha as codfecha,
        t.nombre as torneo_nombre,
        z.nombre as zona_nombre,
        CASE 
          WHEN MAX(wtf.fhcierrecaja) IS NOT NULL THEN 'contabilizada'
          WHEN MAX(wtf.fhcierre) IS NOT NULL THEN 'cerrada'
          ELSE 'abierta'
        END as estado,
        MAX(wtf.fhcierre) as fhcierre,
        MAX(wtf.fhcierrecaja) as fhcierrecaja,
        COALESCE(MAX(wtf.totcierre), 0) as totcierre,
        COALESCE(MAX(wtf.totefectivo), 0) as totefectivo
      FROM partidos p
      INNER JOIN zonas z ON p.idzona = z.id
      INNER JOIN wtorneos t ON z.idtorneo = t.id
      LEFT JOIN sedes s ON p.idsede = s.id
      LEFT JOIN wtorneos_fechas wtf ON p.idfecha = wtf.id
      WHERE p.fhbaja IS NULL
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filtro por torneo
    if (filtros.idtorneo) {
      query += ` AND z.idtorneo = $${paramIndex}`;
      params.push(filtros.idtorneo);
      paramIndex++;
    }

    // Filtro por sede
    if (filtros.idsede) {
      query += ` AND p.idsede = $${paramIndex}`;
      params.push(filtros.idsede);
      paramIndex++;
    }

    // Filtro por fecha desde
    if (filtros.fecha_desde) {
      query += ` AND p.fecha >= $${paramIndex}`;
      params.push(filtros.fecha_desde);
      paramIndex++;
    }

    // Filtro por fecha hasta
    if (filtros.fecha_hasta) {
      query += ` AND p.fecha <= $${paramIndex}`;
      params.push(filtros.fecha_hasta);
      paramIndex++;
    }

    // GROUP BY necesario por las agregaciones
    query += `
      GROUP BY p.id, p.fecha, p.idsede, s.nombre, z.idtorneo, p.nrofecha, t.nombre, z.nombre
    `;

    // Filtro por estado (después del GROUP BY)
    if (filtros.estado) {
      query += ` HAVING `;
      if (filtros.estado === "abierta") {
        query += `(MAX(wtf.fhcierre) IS NULL AND MAX(wtf.fhcierrecaja) IS NULL)`;
      } else if (filtros.estado === "cerrada") {
        query += `(MAX(wtf.fhcierre) IS NOT NULL AND MAX(wtf.fhcierrecaja) IS NULL)`;
      } else if (filtros.estado === "contabilizada") {
        query += `MAX(wtf.fhcierrecaja) IS NOT NULL`;
      }
    }

    query += ` ORDER BY p.id, p.fecha DESC, p.nrofecha DESC`;

    const { rows } = await pool.query(query, params);

    return rows.map((row: any) => ({
      id: row.partido_id,
      idfecha: row.partido_id,
      fecha: row.fecha,
      idsede: row.idsede,
      sede_nombre: row.sede_nombre,
      idtorneo: row.idtorneo,
      codfecha: row.codfecha,
      torneo: row.torneo_nombre,
      torneo_nombre: row.torneo_nombre,
      zona: row.zona_nombre,
      zona_nombre: row.zona_nombre,
      estado: row.estado,
      fhcierre: row.fhcierre,
      fhcierrecaja: row.fhcierrecaja,
      total_caja: parseFloat(row.totcierre || "0"),
    }));
  } catch (error) {
    console.error("Error en getPlanillasByFiltros:", error);
    throw error;
  }
};

// ========================================
// OBTENER PLANILLA COMPLETA POR IDFECHA
// ========================================
export const getPlanillaByIdFecha = async (
  idfecha: number
): Promise<PlanillaCompleta | null> => {
  try {
    // 1. Obtener datos del partido + planilla + nombres de equipos
    const planillaQuery = `
      SELECT 
        p.id as partido_id,
        p.fecha,
        p.idsede,
        s.nombre as sede_nombre,
        z.idtorneo,
        p.nrofecha as codfecha,
        wtf.id as planilla_id,
        wtf.idprofesor,
        wtf.idprofesor_cierre,
        wtf.idturno,
        wtf.observ,
        wtf.observ_caja,
        wtf.fhcarga,
        wtf.fhbaja,
        wtf.fhcierre,
        wtf.fhcierrecaja,
        wtf.idusrcierrecaja,
        wtf.totcierre,
        wtf.totefectivo,
        t.nombre as torneo_nombre,
        z.nombre as zona_nombre,
        p.idequipo1,
        p.idequipo2,
        p.goles1,
        p.goles2,
        p.codestado,
        p.arbitro,
        e1.nombre as nombre_equipo1,
        e2.nombre as nombre_equipo2
      FROM partidos p
      INNER JOIN zonas z ON p.idzona = z.id
      INNER JOIN wtorneos t ON z.idtorneo = t.id
      LEFT JOIN sedes s ON p.idsede = s.id
      LEFT JOIN wtorneos_fechas wtf ON p.idfecha = wtf.id
      LEFT JOIN equipos e1 ON p.idequipo1 = e1.id
      LEFT JOIN equipos e2 ON p.idequipo2 = e2.id
      WHERE p.id = $1
    `;

    const planillaResult = await pool.query(planillaQuery, [idfecha]);

    if (planillaResult.rows.length === 0) {
      return null;
    }

    const row = planillaResult.rows[0];

    const planilla: PlanillaPago = {
      id: row.planilla_id || row.partido_id,
      idfecha: row.partido_id,
      fecha: row.fecha,
      idsede: row.idsede,
      sede_nombre: row.sede_nombre,
      idtorneo: row.idtorneo,
      codfecha: row.codfecha,
      idprofesor: row.idprofesor,
      idprofesor_cierre: row.idprofesor_cierre,
      idturno: row.idturno || undefined,
      observ: row.observ,
      observ_caja: row.observ_caja,
      fhcarga: row.fhcarga,
      fhbaja: row.fhbaja,
      fhcierre: row.fhcierre,
      fhcierrecaja: row.fhcierrecaja,
      idusrcierrecaja: row.idusrcierrecaja,
      totcierre: parseFloat(row.totcierre || "0"),
      totefectivo: parseFloat(row.totefectivo || "0"),
      torneo: row.torneo_nombre,
      torneo_nombre: row.torneo_nombre,
      zona: row.zona_nombre,
      zona_nombre: row.zona_nombre,
      partido_info: {
        nombre1: row.nombre_equipo1,
        nombre2: row.nombre_equipo2,
        goles1: row.goles1,
        goles2: row.goles2,
        codestado: row.codestado,
        arbitro: row.arbitro,
      },
    };

    // 2. Obtener todos los detalles
    const equipos = await getEquiposByPlanilla(
      idfecha,
      row.nombre_equipo1,
      row.nombre_equipo2
    );
    const arbitros = await getArbitrosByPlanilla(idfecha);
    const canchas = await getCanchasByPlanilla(idfecha);
    const profesores = await getProfesoresByPlanilla(idfecha);
    const medico = await getMedicoByPlanilla(idfecha);
    const otros_gastos = await getOtrosGastosByPlanilla(idfecha);

    // 3. Calcular totales
    const totales = calcularTotales(
      equipos,
      arbitros,
      canchas,
      profesores,
      medico,
      otros_gastos
    );

    return {
      planilla,
      equipos,
      arbitros,
      canchas,
      profesores,
      medico,
      otros_gastos,
      totales,
    };
  } catch (error) {
    console.error("Error en getPlanillaByIdFecha:", error);
    throw error;
  }
};

// ========================================
// CREAR PLANILLA BASE
// ========================================
export const createPlanilla = async (
  idfecha: number
): Promise<PlanillaPago> => {
  try {
    // Verificar si ya existe
    const existeQuery = `SELECT id FROM wtorneos_fechas WHERE id = $1`;
    const existe = await pool.query(existeQuery, [idfecha]);

    if (existe.rows.length > 0) {
      throw new Error("Ya existe una planilla para este partido");
    }

    // Obtener datos del partido
    const partidoQuery = `
      SELECT 
        p.fecha, 
        p.idsede,
        p.idsubsede,
        p.nrofecha as codfecha,
        z.idtorneo,
        p.idprofesor
      FROM partidos p
      INNER JOIN zonas z ON p.idzona = z.id
      WHERE p.id = $1
    `;
    const partidoResult = await pool.query(partidoQuery, [idfecha]);

    if (partidoResult.rows.length === 0) {
      throw new Error("Partido no encontrado");
    }

    const partido = partidoResult.rows[0];

    // Crear planilla
    const insertQuery = `
      INSERT INTO wtorneos_fechas 
        (id, fecha, idsede, idsubsede, idtorneo, codfecha, idprofesor, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const { rows } = await pool.query(insertQuery, [
      idfecha,
      partido.fecha,
      partido.idsede,
      partido.idsubsede || null,
      partido.idtorneo,
      partido.codfecha,
      partido.idprofesor || null,
    ]);

    return rows[0];
  } catch (error) {
    console.error("Error en createPlanilla:", error);
    throw error;
  }
};

// ========================================
// EQUIPOS
// ========================================
export const getEquiposByPlanilla = async (
  idfecha: number,
  nombreEquipo1?: string,
  nombreEquipo2?: string
): Promise<PlanillaEquipo[]> => {
  try {
    // Obtener información del partido
    const partidoQuery = `
      SELECT 
        p.idequipo1,
        p.idequipo2,
        e1.nombre as nombre_equipo1,
        e2.nombre as nombre_equipo2
      FROM partidos p
      LEFT JOIN equipos e1 ON p.idequipo1 = e1.id
      LEFT JOIN equipos e2 ON p.idequipo2 = e2.id
      WHERE p.id = $1
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

    // Si no existe planilla, retornar array vacío
    if (planillaResult.rows.length === 0) {
      return [];
    }

    // Buscar registros de pago en las diferentes tablas posibles
    // Primero intentar en fechas_equipos (si existe)
    let equiposResult;
    try {
      equiposResult = await pool.query(
        `SELECT * FROM fechas_equipos WHERE idfecha = $1 ORDER BY orden`,
        [idfecha]
      );
    } catch {
      // La tabla no existe, continuar sin datos
      equiposResult = { rows: [] };
    }

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
        tipopago: 1, // Efectivo por defecto
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

export const addEquipo = async (
  equipo: Omit<PlanillaEquipo, "id">
): Promise<PlanillaEquipo> => {
  try {
    // Verificar si la tabla fechas_equipos existe, si no, crearla o usar wtorneos_fechas
    const query = `
      INSERT INTO fechas_equipos 
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
      equipo.iddeposito,
    ]);

    // Actualizar total de la planilla
    await recalcularTotalesPlanilla(Number(equipo.idfecha));

    return rows[0];
  } catch (error) {
    console.error("Error en addEquipo:", error);
    throw error;
  }
};

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
      UPDATE fechas_equipos 
      SET ${updates.join(", ")}
      WHERE idfecha = $${index} AND orden = $${index + 1}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      throw new Error("Equipo no encontrado");
    }

    // Actualizar totales
    await recalcularTotalesPlanilla(idfecha);

    return rows[0];
  } catch (error) {
    console.error("Error en updateEquipo:", error);
    throw error;
  }
};

export const deleteEquipo = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  try {
    const deleteQuery = `DELETE FROM fechas_equipos WHERE idfecha = $1 AND orden = $2`;
    const result = await pool.query(deleteQuery, [idfecha, orden]);

    // Actualizar totales
    await recalcularTotalesPlanilla(idfecha);

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error en deleteEquipo:", error);
    throw error;
  }
};

// ========================================
// ÁRBITROS
// ========================================
export const getArbitrosByPlanilla = async (
  idfecha: number
): Promise<PlanillaArbitro[]> => {
  try {
    const query = `
      SELECT 
        wa.idfecha,
        wa.orden,
        wa.idarbitro,
        wa.idprofesor,
        wa.partidos,
        wa.valor_partido,
        wa.total,
        wa.fhcarga,
        a.nombre as nombre_arbitro
      FROM fechas_arbitros wa
      LEFT JOIN arbitros a ON wa.idarbitro = a.id
      WHERE wa.idfecha = $1
      ORDER BY wa.orden
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

export const addArbitro = async (
  arbitro: Omit<PlanillaArbitro, "total" | "fhcarga">
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

    await recalcularTotalesPlanilla(Number(arbitro.idfecha));

    return rows[0];
  } catch (error) {
    console.error("Error en addArbitro:", error);
    throw error;
  }
};

export const updateArbitro = async (
  idfecha: number,
  orden: number,
  arbitro: Partial<PlanillaArbitro>
): Promise<PlanillaArbitro> => {
  try {
    const getCurrentQuery = `
      SELECT partidos, valor_partido 
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

    await recalcularTotalesPlanilla(idfecha);

    return rows[0];
  } catch (error) {
    console.error("Error en updateArbitro:", error);
    throw error;
  }
};

export const deleteArbitro = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  try {
    const query = `DELETE FROM fechas_arbitros WHERE idfecha = $1 AND orden = $2`;
    const result = await pool.query(query, [idfecha, orden]);
    await recalcularTotalesPlanilla(idfecha);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error en deleteArbitro:", error);
    throw error;
  }
};

// ========================================
// CANCHAS
// ========================================
export const getCanchasByPlanilla = async (
  idfecha: number
): Promise<PlanillaCancha[]> => {
  try {
    const query = `SELECT * FROM fechas_canchas WHERE idfecha = $1 ORDER BY orden`;
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

    await recalcularTotalesPlanilla(Number(cancha.idfecha));
    return rows[0];
  } catch (error) {
    console.error("Error en addCancha:", error);
    throw error;
  }
};

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

    await recalcularTotalesPlanilla(idfecha);
    return rows[0];
  } catch (error) {
    console.error("Error en updateCancha:", error);
    throw error;
  }
};

export const deleteCancha = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  try {
    const query = `DELETE FROM fechas_canchas WHERE idfecha = $1 AND orden = $2`;
    const result = await pool.query(query, [idfecha, orden]);
    await recalcularTotalesPlanilla(idfecha);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error en deleteCancha:", error);
    throw error;
  }
};

// ========================================
// PROFESORES
// ========================================
export const getProfesoresByPlanilla = async (
  idfecha: number
): Promise<PlanillaProfesor[]> => {
  try {
    const query = `
      SELECT 
        fp.*,
        p.nombre as nombre_profesor
      FROM fechas_profes fp
      LEFT JOIN profesores p ON fp.idprofesor = p.id
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

export const addProfesor = async (
  profesor: Omit<PlanillaProfesor, "total" | "fhcarga">
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

    await recalcularTotalesPlanilla(Number(profesor.idfecha));
    return rows[0];
  } catch (error) {
    console.error("Error en addProfesor:", error);
    throw error;
  }
};

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

    await recalcularTotalesPlanilla(idfecha);
    return rows[0];
  } catch (error) {
    console.error("Error en updateProfesor:", error);
    throw error;
  }
};

export const deleteProfesor = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  try {
    const query = `DELETE FROM fechas_profes WHERE idfecha = $1 AND orden = $2`;
    const result = await pool.query(query, [idfecha, orden]);
    await recalcularTotalesPlanilla(idfecha);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error en deleteProfesor:", error);
    throw error;
  }
};

// ========================================
// MÉDICOS
// ========================================
export const getMedicoByPlanilla = async (
  idfecha: number
): Promise<PlanillaMedico[]> => {
  try {
    const query = `
      SELECT 
        fm.*,
        m.nombre as nombre_medico
      FROM fechas_medico fm
      LEFT JOIN medicos m ON fm.idmedico = m.id
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

export const addMedico = async (
  medico: Omit<PlanillaMedico, "total" | "fhcarga">
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

    await recalcularTotalesPlanilla(Number(medico.idfecha));
    return rows[0];
  } catch (error) {
    console.error("Error en addMedico:", error);
    throw error;
  }
};

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

    await recalcularTotalesPlanilla(idfecha);
    return rows[0];
  } catch (error) {
    console.error("Error en updateMedico:", error);
    throw error;
  }
};

export const deleteMedico = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  try {
    const query = `DELETE FROM fechas_medico WHERE idfecha = $1 AND orden = $2`;
    const result = await pool.query(query, [idfecha, orden]);
    await recalcularTotalesPlanilla(idfecha);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error en deleteMedico:", error);
    throw error;
  }
};

// ========================================
// OTROS GASTOS
// ========================================
export const getOtrosGastosByPlanilla = async (
  idfecha: number
): Promise<PlanillaOtroGasto[]> => {
  try {
    const query = `
      SELECT 
        fo.*,
        g.descripcion as descripcion_gasto
      FROM fechas_otros fo
      LEFT JOIN gastos g ON fo.codgasto = g.id
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

export const addOtroGasto = async (
  gasto: Omit<PlanillaOtroGasto, "total" | "fhcarga">
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

    await recalcularTotalesPlanilla(Number(gasto.idfecha));
    return rows[0];
  } catch (error) {
    console.error("Error en addOtroGasto:", error);
    throw error;
  }
};

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

    await recalcularTotalesPlanilla(idfecha);
    return rows[0];
  } catch (error) {
    console.error("Error en updateOtroGasto:", error);
    throw error;
  }
};

export const deleteOtroGasto = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  try {
    const query = `DELETE FROM fechas_otros WHERE idfecha = $1 AND orden = $2`;
    const result = await pool.query(query, [idfecha, orden]);
    await recalcularTotalesPlanilla(idfecha);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error en deleteOtroGasto:", error);
    throw error;
  }
};

// ========================================
// UTILIDADES
// ========================================

const calcularTotales = (
  equipos: PlanillaEquipo[],
  arbitros: PlanillaArbitro[],
  canchas: PlanillaCancha[],
  profesores: PlanillaProfesor[],
  medico: PlanillaMedico[],
  otros_gastos: PlanillaOtroGasto[]
) => {
  // Ingresos
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

  // Egresos
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

  const total_caja = total_ingresos - total_egresos;
  const total_efectivo = ingreso_fecha - total_egresos;
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

const recalcularTotalesPlanilla = async (idfecha: number): Promise<void> => {
  try {
    // Obtener todos los datos
    const equipos = await getEquiposByPlanilla(idfecha);
    const arbitros = await getArbitrosByPlanilla(idfecha);
    const canchas = await getCanchasByPlanilla(idfecha);
    const profesores = await getProfesoresByPlanilla(idfecha);
    const medico = await getMedicoByPlanilla(idfecha);
    const otros_gastos = await getOtrosGastosByPlanilla(idfecha);

    // Calcular totales
    const totales = calcularTotales(
      equipos,
      arbitros,
      canchas,
      profesores,
      medico,
      otros_gastos
    );

    // Actualizar en wtorneos_fechas
    const updateQuery = `
      UPDATE wtorneos_fechas 
      SET totcierre = $1, totefectivo = $2
      WHERE id = $3
    `;

    await pool.query(updateQuery, [
      totales.total_caja,
      totales.total_efectivo,
      idfecha,
    ]);
  } catch (error) {
    console.error("Error en recalcularTotalesPlanilla:", error);
    // No lanzar el error para no bloquear otras operaciones
  }
};

// ========================================
// CERRAR PLANILLA
// ========================================
export const cerrarPlanilla = async (
  idfecha: number,
  idprofesor: number
): Promise<void> => {
  try {
    const query = `
      UPDATE wtorneos_fechas 
      SET fhcierre = NOW(), idprofesor_cierre = $1
      WHERE id = $2
    `;
    await pool.query(query, [idprofesor, idfecha]);
  } catch (error) {
    console.error("Error en cerrarPlanilla:", error);
    throw error;
  }
};

// ========================================
// CERRAR CAJA
// ========================================
export const cerrarCaja = async (
  idfecha: number,
  idusuario: number
): Promise<void> => {
  try {
    const query = `
      UPDATE wtorneos_fechas 
      SET fhcierrecaja = NOW(), idusrcierrecaja = $1
      WHERE id = $2
    `;
    await pool.query(query, [idusuario, idfecha]);
  } catch (error) {
    console.error("Error en cerrarCaja:", error);
    throw error;
  }
};
