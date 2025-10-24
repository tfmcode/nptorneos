// ========================================
// PLANILLAS DE PAGO MODEL
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
      SELECT 
        p.id as partido_id,
        p.fecha,
        p.idsede,
        p.idsubsede,
        p.idtorneo,
        p.codfecha,
        s.descrip as sede_nombre,
        ss.descrip as subsede_nombre,
        t.descrip as torneo_nombre,
        CASE 
          WHEN wf.id IS NULL THEN 'abierta'
          WHEN wf.fhcierrecaja IS NOT NULL THEN 'contabilizada'
          WHEN wf.fhcierre IS NOT NULL THEN 'cerrada'
          ELSE 'abierta'
        END as estado,
        wf.id as planilla_id,
        wf.totcierre,
        wf.totefectivo,
        pr.apellido || ', ' || pr.nombre as profesor_nombre
      FROM partidos p
      INNER JOIN sedes s ON p.idsede = s.id
      LEFT JOIN subsedes ss ON p.idsubsede = ss.id
      INNER JOIN torneos t ON p.idtorneo = t.id
      LEFT JOIN wfechas_equipos wf ON p.id = wf.idfecha
      LEFT JOIN profesores pr ON wf.idprofesor = pr.id
      WHERE p.codestado = 40
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filtro por torneo (obligatorio)
    if (filtros.idtorneo) {
      query += ` AND p.idtorneo = $${paramIndex}`;
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

    // Filtro por estado
    if (filtros.estado) {
      if (filtros.estado === "abierta") {
        query += ` AND (wf.id IS NULL OR (wf.fhcierre IS NULL AND wf.fhcierrecaja IS NULL))`;
      } else if (filtros.estado === "cerrada") {
        query += ` AND wf.fhcierre IS NOT NULL AND wf.fhcierrecaja IS NULL`;
      } else if (filtros.estado === "contabilizada") {
        query += ` AND wf.fhcierrecaja IS NOT NULL`;
      }
    }

    query += ` ORDER BY p.fecha DESC, p.codfecha DESC`;

    const { rows } = await pool.query(query, params);

    return rows.map((row: any) => ({
      id: row.planilla_id || row.partido_id,
      idfecha: row.partido_id,
      fecha: row.fecha,
      idsede: row.idsede,
      idsubsede: row.idsubsede,
      idtorneo: row.idtorneo,
      codfecha: row.codfecha,
      sede: row.sede_nombre,
      subsede: row.subsede_nombre,
      torneo: row.torneo_nombre,
      estado: row.estado,
      total_caja: parseFloat(row.totcierre || "0"),
      profesor: row.profesor_nombre,
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
    // 1. Obtener datos del partido + planilla
    const planillaQuery = `
      SELECT 
        p.id as partido_id,
        p.fecha,
        p.idsede,
        p.idsubsede,
        p.idtorneo,
        p.codfecha,
        wf.id as planilla_id,
        wf.idprofesor,
        wf.idprofesor_cierre,
        wf.idturno,
        wf.observ,
        wf.observ_caja,
        wf.fhcarga,
        wf.fhbaja,
        wf.fhcierre,
        wf.fhcierrecaja,
        wf.idusrcierrecaja,
        wf.totcierre,
        wf.totefectivo,
        s.descrip as sede_nombre,
        ss.descrip as subsede_nombre,
        t.descrip as torneo_nombre,
        pr.apellido || ', ' || pr.nombre as profesor_nombre
      FROM partidos p
      INNER JOIN sedes s ON p.idsede = s.id
      LEFT JOIN subsedes ss ON p.idsubsede = ss.id
      INNER JOIN torneos t ON p.idtorneo = t.id
      LEFT JOIN wfechas_equipos wf ON p.id = wf.idfecha
      LEFT JOIN profesores pr ON wf.idprofesor = pr.id
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
      idsubsede: row.idsubsede,
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
      sede: row.sede_nombre,
      subsede: row.subsede_nombre,
      torneo: row.torneo_nombre,
      profesor: row.profesor_nombre,
    };

    // 2. Obtener todos los detalles
    const equipos = await getEquiposByPlanilla(idfecha);
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
    const existeQuery = `SELECT id FROM wfechas_equipos WHERE idfecha = $1`;
    const existe = await pool.query(existeQuery, [idfecha]);

    if (existe.rows.length > 0) {
      throw new Error("Ya existe una planilla para este partido");
    }

    // Obtener datos del partido
    const partidoQuery = `
      SELECT fecha, idsede, idsubsede, idtorneo, codfecha 
      FROM partidos 
      WHERE id = $1
    `;
    const partidoResult = await pool.query(partidoQuery, [idfecha]);

    if (partidoResult.rows.length === 0) {
      throw new Error("Partido no encontrado");
    }

    const partido = partidoResult.rows[0];

    // Crear planilla
    const insertQuery = `
      INSERT INTO wfechas_equipos 
        (idfecha, fecha, idsede, idsubsede, idtorneo, codfecha, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    const { rows } = await pool.query(insertQuery, [
      idfecha,
      partido.fecha,
      partido.idsede,
      partido.idsubsede,
      partido.idtorneo,
      partido.codfecha,
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
  idfecha: number
): Promise<PlanillaEquipo[]> => {
  try {
    // 1. Obtener equipos del partido
    const partidoQuery = `
      SELECT 
        ideqlocal as idequipo1,
        ideqvisitante as idequipo2
      FROM partidos
      WHERE id = $1
    `;
    const partidoResult = await pool.query(partidoQuery, [idfecha]);

    if (partidoResult.rows.length === 0) {
      return [];
    }

    const { idequipo1, idequipo2 } = partidoResult.rows[0];

    // 2. Obtener registros de pago si existen
    const equiposQuery = `
      SELECT 
        we.*,
        e.descrip as nombre_equipo
      FROM wfechas_equipos_equipos we
      INNER JOIN equipos e ON we.idequipo = e.id
      WHERE we.idfecha = $1
      ORDER BY we.orden
    `;
    const equiposResult = await pool.query(equiposQuery, [idfecha]);

    // 3. Si hay registros, devolverlos
    if (equiposResult.rows.length > 0) {
      return equiposResult.rows.map((row: any) => ({
        id: row.id,
        idfecha: row.idfecha,
        orden: row.orden,
        idequipo: row.idequipo,
        tipopago: row.tipopago,
        importe: parseFloat(row.importe || "0"),
        iddeposito: row.iddeposito,
        fhcarga: row.fhcarga,
        nombre_equipo: row.nombre_equipo,
      }));
    }

    // 4. Si no hay registros, crear entradas por defecto
    const equiposDefault: PlanillaEquipo[] = [];

    // Obtener nombre del equipo 1
    const equipo1Query = `SELECT descrip FROM equipos WHERE id = $1`;
    const equipo1Result = await pool.query(equipo1Query, [idequipo1]);
    equiposDefault.push({
      idfecha,
      orden: 1,
      idequipo: idequipo1,
      tipopago: 3, // Fecha
      importe: 0,
      nombre_equipo: equipo1Result.rows[0]?.descrip || "Equipo Local",
    });

    // Obtener nombre del equipo 2
    const equipo2Query = `SELECT descrip FROM equipos WHERE id = $1`;
    const equipo2Result = await pool.query(equipo2Query, [idequipo2]);
    equiposDefault.push({
      idfecha,
      orden: 2,
      idequipo: idequipo2,
      tipopago: 3, // Fecha
      importe: 0,
      nombre_equipo: equipo2Result.rows[0]?.descrip || "Equipo Visitante",
    });

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
    // Calcular total
    const total = equipo.importe;

    const query = `
      INSERT INTO wfechas_equipos_equipos 
        (idfecha, orden, idequipo, tipopago, importe, iddeposito, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      equipo.idfecha,
      equipo.orden,
      equipo.idequipo,
      equipo.tipopago,
      total,
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
  id: number,
  equipo: Partial<PlanillaEquipo>
): Promise<PlanillaEquipo> => {
  try {
    // Si cambia el importe, recalcular
    if (equipo.importe !== undefined) {
      const query = `
        UPDATE wfechas_equipos_equipos 
        SET importe = $1
        WHERE id = $2
        RETURNING *
      `;
      const { rows } = await pool.query(query, [equipo.importe, id]);

      // Actualizar totales
      await recalcularTotalesPlanilla(Number(rows[0].idfecha));

      return rows[0];
    }

    // Actualización genérica
    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const key in equipo) {
      if (
        equipo[key as keyof PlanillaEquipo] !== undefined &&
        key !== "id" &&
        key !== "idfecha"
      ) {
        updates.push(`${key} = $${index}`);
        values.push(equipo[key as keyof PlanillaEquipo]);
        index++;
      }
    }

    if (updates.length === 0) {
      throw new Error("No hay datos para actualizar.");
    }

    values.push(id);
    const query = `
      UPDATE wfechas_equipos_equipos 
      SET ${updates.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error("Error en updateEquipo:", error);
    throw error;
  }
};

export const deleteEquipo = async (id: number): Promise<boolean> => {
  try {
    // Obtener idfecha antes de borrar
    const getQuery = `SELECT idfecha FROM wfechas_equipos_equipos WHERE id = $1`;
    const getResult = await pool.query(getQuery, [id]);

    if (getResult.rows.length === 0) {
      throw new Error("Equipo no encontrado");
    }

    const idfecha = getResult.rows[0].idfecha;

    // Borrar
    const deleteQuery = `DELETE FROM wfechas_equipos_equipos WHERE id = $1`;
    const result = await pool.query(deleteQuery, [id]);

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
        wa.*,
        a.apellido || ', ' || a.nombre as nombre_arbitro
      FROM wfechas_equipos_arbitros wa
      INNER JOIN arbitros a ON wa.idarbitro = a.id
      WHERE wa.idfecha = $1
      ORDER BY wa.orden
    `;

    const { rows } = await pool.query(query, [idfecha]);

    return rows.map((row: any) => ({
      idfecha: row.idfecha,
      orden: row.orden,
      idarbitro: row.idarbitro,
      idprofesor: row.idprofesor,
      partidos: row.partidos,
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
    // Calcular total
    const total = Number(arbitro.partidos) * Number(arbitro.valor_partido);

    const query = `
      INSERT INTO wfechas_equipos_arbitros 
        (idfecha, orden, idarbitro, idprofesor, partidos, valor_partido, total, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      arbitro.idfecha,
      arbitro.orden,
      arbitro.idarbitro,
      arbitro.idprofesor,
      arbitro.partidos,
      arbitro.valor_partido,
      total,
    ]);

    // Actualizar total de la planilla
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
    // Obtener datos actuales
    const getCurrentQuery = `
      SELECT partidos, valor_partido 
      FROM wfechas_equipos_arbitros 
      WHERE idfecha = $1 AND orden = $2
    `;
    const currentResult = await pool.query(getCurrentQuery, [idfecha, orden]);

    if (currentResult.rows.length === 0) {
      throw new Error("Árbitro no encontrado");
    }

    const current = currentResult.rows[0];

    // Calcular nuevo total
    const partidos = arbitro.partidos ?? current.partidos;
    const valor_partido = arbitro.valor_partido ?? current.valor_partido;
    const total = Number(partidos) * Number(valor_partido);

    const updateQuery = `
      UPDATE wfechas_equipos_arbitros 
      SET partidos = $1, valor_partido = $2, total = $3
      WHERE idfecha = $4 AND orden = $5
      RETURNING *
    `;

    const { rows } = await pool.query(updateQuery, [
      partidos,
      valor_partido,
      total,
      idfecha,
      orden,
    ]);

    // Actualizar totales
    await recalcularTotalesPlanilla(Number(idfecha));

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
    const query = `
      DELETE FROM wfechas_equipos_arbitros 
      WHERE idfecha = $1 AND orden = $2
    `;
    const result = await pool.query(query, [idfecha, orden]);

    // Actualizar totales
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
    const query = `
      SELECT * 
      FROM wfechas_equipos_canchas 
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

export const addCancha = async (
  cancha: Omit<PlanillaCancha, "total" | "fhcarga">
): Promise<PlanillaCancha> => {
  try {
    const total = Number(cancha.horas) * Number(cancha.valor_hora);

    const query = `
      INSERT INTO wfechas_equipos_canchas 
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
      FROM wfechas_equipos_canchas 
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
      UPDATE wfechas_equipos_canchas 
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

    await recalcularTotalesPlanilla(Number(idfecha));

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
    const query = `
      DELETE FROM wfechas_equipos_canchas 
      WHERE idfecha = $1 AND orden = $2
    `;
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
        wp.*,
        p.apellido || ', ' || p.nombre as nombre_profesor
      FROM wfechas_equipos_profesores wp
      INNER JOIN profesores p ON wp.idprofesor = p.id
      WHERE wp.idfecha = $1
      ORDER BY wp.orden
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
      INSERT INTO wfechas_equipos_profesores 
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
      SELECT horas, valor_hora 
      FROM wfechas_equipos_profesores 
      WHERE idfecha = $1 AND orden = $2
    `;
    const currentResult = await pool.query(getCurrentQuery, [idfecha, orden]);

    if (currentResult.rows.length === 0) {
      throw new Error("Profesor no encontrado");
    }

    const current = currentResult.rows[0];
    const horas = profesor.horas ?? current.horas;
    const valor_hora = profesor.valor_hora ?? current.valor_hora;
    const total = Number(horas) * Number(valor_hora);

    const updateQuery = `
      UPDATE wfechas_equipos_profesores 
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
    console.error("Error en updateProfesor:", error);
    throw error;
  }
};

export const deleteProfesor = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  try {
    const query = `
      DELETE FROM wfechas_equipos_profesores 
      WHERE idfecha = $1 AND orden = $2
    `;
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
        wm.*,
        m.apellido || ', ' || m.nombre as nombre_medico
      FROM wfechas_equipos_medico wm
      INNER JOIN medicos m ON wm.idmedico = m.id
      WHERE wm.idfecha = $1
      ORDER BY wm.orden
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
      INSERT INTO wfechas_equipos_medico 
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
      SELECT horas, valor_hora 
      FROM wfechas_equipos_medico 
      WHERE idfecha = $1 AND orden = $2
    `;
    const currentResult = await pool.query(getCurrentQuery, [idfecha, orden]);

    if (currentResult.rows.length === 0) {
      throw new Error("Médico no encontrado");
    }

    const current = currentResult.rows[0];
    const horas = medico.horas ?? current.horas;
    const valor_hora = medico.valor_hora ?? current.valor_hora;
    const total = Number(horas) * Number(valor_hora);

    const updateQuery = `
      UPDATE wfechas_equipos_medico 
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
    console.error("Error en updateMedico:", error);
    throw error;
  }
};

export const deleteMedico = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  try {
    const query = `
      DELETE FROM wfechas_equipos_medico 
      WHERE idfecha = $1 AND orden = $2
    `;
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
        wg.*,
        g.descrip as descripcion_gasto
      FROM wfechas_equipos_gastos wg
      INNER JOIN gastos g ON wg.codgasto = g.id
      WHERE wg.idfecha = $1
      ORDER BY wg.orden
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
      INSERT INTO wfechas_equipos_gastos 
        (idfecha, orden, codgasto, idprofesor, cantidad, valor_unidad, total, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      gasto.idfecha,
      gasto.orden,
      gasto.codgasto,
      gasto.idprofesor,
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
      SELECT cantidad, valor_unidad 
      FROM wfechas_equipos_gastos 
      WHERE idfecha = $1 AND orden = $2
    `;
    const currentResult = await pool.query(getCurrentQuery, [idfecha, orden]);

    if (currentResult.rows.length === 0) {
      throw new Error("Gasto no encontrado");
    }

    const current = currentResult.rows[0];
    const cantidad = gasto.cantidad ?? current.cantidad;
    const valor_unidad = gasto.valor_unidad ?? current.valor_unidad;
    const total = Number(cantidad) * Number(valor_unidad);

    const updateQuery = `
      UPDATE wfechas_equipos_gastos 
      SET cantidad = $1, valor_unidad = $2, total = $3
      WHERE idfecha = $4 AND orden = $5
      RETURNING *
    `;

    const { rows } = await pool.query(updateQuery, [
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
    const query = `
      DELETE FROM wfechas_equipos_gastos 
      WHERE idfecha = $1 AND orden = $2
    `;
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

    // Actualizar en wfechas_equipos
    const updateQuery = `
      UPDATE wfechas_equipos 
      SET totcierre = $1, totefectivo = $2
      WHERE idfecha = $3
    `;

    await pool.query(updateQuery, [
      totales.total_caja,
      totales.total_efectivo,
      idfecha,
    ]);
  } catch (error) {
    console.error("Error en recalcularTotalesPlanilla:", error);
    throw error;
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
      UPDATE wfechas_equipos 
      SET fhcierre = NOW(), idprofesor_cierre = $1
      WHERE idfecha = $2
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
      UPDATE wfechas_equipos 
      SET fhcierrecaja = NOW(), idusrcierrecaja = $1
      WHERE idfecha = $2
    `;

    await pool.query(query, [idusuario, idfecha]);
  } catch (error) {
    console.error("Error en cerrarCaja:", error);
    throw error;
  }
};
