// ========================================
// PLANILLAS DE PAGO MODEL - REFACTORIZADO Y MODULARIZADO
// ========================================

import { pool } from "../config/db";
import {
  PlanillaPago,
  PlanillaCompleta,
  PlanillasFiltros,
} from "../types/planillasPago";

// Importar servicios modulares
import * as equiposService from "./planillas/equiposService";
import * as arbitrosService from "./planillas/arbitrosService";
import * as canchasService from "./planillas/canchasService";
import * as profesoresService from "./planillas/profesoresService";
import * as medicosService from "./planillas/medicosService";
import * as otrosGastosService from "./planillas/otrosGastosService";
import { calcularTotales } from "./planillas/utils";

// ========================================
// RE-EXPORTAR SERVICIOS PARA MANTENER LA COMPATIBILIDAD
// ========================================
export const getEquiposByPlanilla = equiposService.getEquiposByPlanilla;
export const addEquipo = equiposService.addEquipo;
export const updateEquipo = equiposService.updateEquipo;
export const deleteEquipo = equiposService.deleteEquipo;

export const getArbitrosByPlanilla = arbitrosService.getArbitrosByPlanilla;
export const addArbitro = arbitrosService.addArbitro;
export const updateArbitro = arbitrosService.updateArbitro;
export const deleteArbitro = arbitrosService.deleteArbitro;

export const getCanchasByPlanilla = canchasService.getCanchasByPlanilla;
export const addCancha = canchasService.addCancha;
export const updateCancha = canchasService.updateCancha;
export const deleteCancha = canchasService.deleteCancha;

export const getProfesoresByPlanilla =
  profesoresService.getProfesoresByPlanilla;
export const addProfesor = profesoresService.addProfesor;
export const updateProfesor = profesoresService.updateProfesor;
export const deleteProfesor = profesoresService.deleteProfesor;

export const getMedicoByPlanilla = medicosService.getMedicoByPlanilla;
export const addMedico = medicosService.addMedico;
export const updateMedico = medicosService.updateMedico;
export const deleteMedico = medicosService.deleteMedico;

export const getOtrosGastosByPlanilla =
  otrosGastosService.getOtrosGastosByPlanilla;
export const addOtroGasto = otrosGastosService.addOtroGasto;
export const updateOtroGasto = otrosGastosService.updateOtroGasto;
export const deleteOtroGasto = otrosGastosService.deleteOtroGasto;

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
      LEFT JOIN wsedes s ON p.idsede = s.id
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

    query += `
      GROUP BY p.id, p.fecha, p.idsede, s.nombre, z.idtorneo, p.nrofecha, t.nombre, z.nombre
    `;

    // Filtro por estado
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
    // 1. Obtener datos del partido + planilla
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
      LEFT JOIN wsedes s ON p.idsede = s.id
      LEFT JOIN wtorneos_fechas wtf ON p.idfecha = wtf.id
      LEFT JOIN wequipos e1 ON p.idequipo1 = e1.id
      LEFT JOIN wequipos e2 ON p.idequipo2 = e2.id
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

    // 2. Obtener todos los detalles usando servicios modulares
    const equipos = await equiposService.getEquiposByPlanilla(
      idfecha,
      row.nombre_equipo1,
      row.nombre_equipo2
    );
    const arbitros = await arbitrosService.getArbitrosByPlanilla(idfecha);
    const canchas = await canchasService.getCanchasByPlanilla(idfecha);
    const profesores = await profesoresService.getProfesoresByPlanilla(idfecha);
    const medico = await medicosService.getMedicoByPlanilla(idfecha);
    const otros_gastos = await otrosGastosService.getOtrosGastosByPlanilla(
      idfecha
    );

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
// RECALCULAR TOTALES DE PLANILLA
// ========================================
export const recalcularTotalesPlanilla = async (
  idfecha: number
): Promise<void> => {
  try {
    // Obtener todos los datos usando servicios modulares
    const equipos = await equiposService.getEquiposByPlanilla(idfecha);
    const arbitros = await arbitrosService.getArbitrosByPlanilla(idfecha);
    const canchas = await canchasService.getCanchasByPlanilla(idfecha);
    const profesores = await profesoresService.getProfesoresByPlanilla(idfecha);
    const medico = await medicosService.getMedicoByPlanilla(idfecha);
    const otros_gastos = await otrosGastosService.getOtrosGastosByPlanilla(
      idfecha
    );

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
// CERRAR CAJA (CONTABILIZAR)
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
