// Backend/src/models/planillasPagoModel.ts
// ========================================
// PLANILLAS DE PAGO MODEL - REFACTORIZADO
// ✅ CORREGIDO: Agregados JOINs con proveedores y codificadores
// ✅ CORREGIDO: Usa cod.descripcion (no cod.nombre)
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
// ✅ CORREGIDO: Agregados JOINs con proveedores y codificadores
// ✅ USA cod.descripcion (tu tabla tiene descripcion, no nombre)
// ========================================
export const getPlanillasByFiltros = async (
  filtros: PlanillasFiltros
): Promise<PlanillaPago[]> => {
  try {
    // ✅ PARTIR DESDE wtorneos_fechas como fuente principal
    // ✅ AGREGADO: JOINs con proveedores y codificadores
    let query = `
      SELECT 
        wtf.id as planilla_id,
        wtf.fecha,
        wtf.idsede,
        wtf.idsubsede,
        wtf.codfecha,
        wtf.idtorneo,
        wtf.idprofesor,
        wtf.idprofesor_cierre,
        wtf.idturno,
        wtf.fhcarga,
        wtf.fhcierre,
        wtf.fhcierrecaja,
        wtf.totcierre,
        wtf.totefectivo,
        wtf.observ,
        wtf.observ_caja,
        s.nombre as sede_nombre,
        t.nombre as torneo_nombre,
        -- ✅ NUEVO: Nombre del profesor desde proveedores
        prov.nombre as profesor_nombre,
        -- ✅ NUEVO: DESCRIPCION del turno desde codificadores
        cod.descripcion as turno_nombre,
        CASE 
          WHEN wtf.fhcierrecaja IS NOT NULL THEN 'contabilizada'
          WHEN wtf.fhcierre IS NOT NULL THEN 'cerrada'
          ELSE 'abierta'
        END as estado,
        -- Contar partidos asociados a esta caja
        (SELECT COUNT(*) FROM partidos p 
         WHERE p.idfecha = wtf.id AND p.fhbaja IS NULL) as cantidad_partidos,
        -- Obtener zona del primer partido (para mostrar info adicional)
        (SELECT z.nombre FROM partidos p 
         INNER JOIN zonas z ON p.idzona = z.id
         WHERE p.idfecha = wtf.id AND p.fhbaja IS NULL 
         LIMIT 1) as zona_nombre
      FROM wtorneos_fechas wtf
      LEFT JOIN wsedes s ON wtf.idsede = s.id
      LEFT JOIN wtorneos t ON wtf.idtorneo = t.id
      -- ✅ NUEVO: JOIN con proveedores para obtener nombre del profesor
      LEFT JOIN proveedores prov ON wtf.idprofesor = prov.id
      -- ✅ NUEVO: JOIN con codificadores para obtener DESCRIPCION del turno
      LEFT JOIN codificadores cod ON wtf.idturno = cod.id AND cod.idcodificador = 7
      WHERE wtf.fhbaja IS NULL
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filtro por torneo
    if (filtros.idtorneo) {
      query += ` AND wtf.idtorneo = $${paramIndex}`;
      params.push(filtros.idtorneo);
      paramIndex++;
    }

    // Filtro por sede
    if (filtros.idsede) {
      query += ` AND wtf.idsede = $${paramIndex}`;
      params.push(filtros.idsede);
      paramIndex++;
    }

    // Filtro por fecha desde
    if (filtros.fecha_desde) {
      query += ` AND wtf.fecha >= $${paramIndex}`;
      params.push(filtros.fecha_desde);
      paramIndex++;
    }

    // Filtro por fecha hasta
    if (filtros.fecha_hasta) {
      query += ` AND wtf.fecha <= $${paramIndex}`;
      params.push(filtros.fecha_hasta);
      paramIndex++;
    }

    // Filtro por estado
    if (filtros.estado) {
      if (filtros.estado === "abierta") {
        query += ` AND wtf.fhcierre IS NULL AND wtf.fhcierrecaja IS NULL`;
      } else if (filtros.estado === "cerrada") {
        query += ` AND wtf.fhcierre IS NOT NULL AND wtf.fhcierrecaja IS NULL`;
      } else if (filtros.estado === "contabilizada") {
        query += ` AND wtf.fhcierrecaja IS NOT NULL`;
      }
    }

    query += ` ORDER BY wtf.fecha DESC, wtf.codfecha DESC`;

    const { rows } = await pool.query(query, params);

    return rows.map((row: any) => ({
      id: row.planilla_id,
      idfecha: row.planilla_id,
      fecha: row.fecha,
      idsede: row.idsede,
      idsubsede: row.idsubsede,
      sede_nombre: row.sede_nombre,
      idtorneo: row.idtorneo,
      codfecha: row.codfecha,
      idprofesor: row.idprofesor,
      profesor_nombre: row.profesor_nombre, // ✅ NUEVO
      idturno: row.idturno,
      turno_nombre: row.turno_nombre, // ✅ NUEVO
      torneo: row.torneo_nombre,
      torneo_nombre: row.torneo_nombre,
      zona: row.zona_nombre,
      zona_nombre: row.zona_nombre,
      estado: row.estado,
      fhcierre: row.fhcierre,
      fhcierrecaja: row.fhcierrecaja,
      total_caja: parseFloat(row.totcierre || "0"),
      cantidad_partidos: row.cantidad_partidos || 0,
    }));
  } catch (error) {
    console.error("Error en getPlanillasByFiltros:", error);
    throw error;
  }
};

// ========================================
// OBTENER PLANILLA COMPLETA POR IDFECHA
// ✅ CORREGIDO: Agregados JOINs con proveedores y codificadores
// ✅ USA cod.descripcion (tu tabla tiene descripcion, no nombre)
// ========================================
export const getPlanillaByIdFecha = async (
  idfecha: number
): Promise<PlanillaCompleta | null> => {
  try {
    // ✅ CORREGIDO: Agregados JOINs con proveedores y codificadores
    const planillaQuery = `
      SELECT 
        wtf.id as planilla_id,
        wtf.fecha,
        wtf.idsede,
        wtf.idsubsede,
        wtf.idtorneo,
        wtf.codfecha,
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
        s.nombre as sede_nombre,
        t.nombre as torneo_nombre,
        -- ✅ NUEVO: Nombre del profesor asignado
        prov.nombre as profesor_nombre,
        -- ✅ NUEVO: Nombre del profesor que cerró
        prov_cierre.nombre as profesor_cierre_nombre,
        -- ✅ NUEVO: DESCRIPCION del turno
        cod.descripcion as turno_nombre
      FROM wtorneos_fechas wtf
      LEFT JOIN wsedes s ON wtf.idsede = s.id
      LEFT JOIN wtorneos t ON wtf.idtorneo = t.id
      -- ✅ NUEVO: JOIN con proveedores para el profesor asignado
      LEFT JOIN proveedores prov ON wtf.idprofesor = prov.id
      -- ✅ NUEVO: JOIN con proveedores para el profesor que cerró
      LEFT JOIN proveedores prov_cierre ON wtf.idprofesor_cierre = prov_cierre.id
      -- ✅ NUEVO: JOIN con codificadores para el turno (usa descripcion)
      LEFT JOIN codificadores cod ON wtf.idturno = cod.id AND cod.idcodificador = 7
      WHERE wtf.id = $1
    `;

    const planillaResult = await pool.query(planillaQuery, [idfecha]);

    if (planillaResult.rows.length === 0) {
      return null;
    }

    const row = planillaResult.rows[0];

    // ✅ SIMPLIFICADO: Solo obtener zona de los partidos (para contexto)
    // La información deportiva (goles, árbitro, estado) NO es relevante en planillas de pago
    const partidosQuery = `
      SELECT
        z.nombre as zona_nombre
      FROM partidos p
      LEFT JOIN zonas z ON p.idzona = z.id
      WHERE p.idfecha = $1 AND p.fhbaja IS NULL
      LIMIT 1
    `;
    const partidosResult = await pool.query(partidosQuery, [idfecha]);

    const planilla: PlanillaPago = {
      id: row.planilla_id,
      idfecha: row.planilla_id,
      fecha: row.fecha,
      idsede: row.idsede,
      idsubsede: row.idsubsede,
      sede_nombre: row.sede_nombre,
      idtorneo: row.idtorneo,
      codfecha: row.codfecha,
      idprofesor: row.idprofesor,
      profesor_nombre: row.profesor_nombre, // ✅ NUEVO
      idprofesor_cierre: row.idprofesor_cierre,
      profesor_cierre_nombre: row.profesor_cierre_nombre, // ✅ NUEVO
      idturno: row.idturno || undefined,
      turno_nombre: row.turno_nombre, // ✅ NUEVO
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
      // ✅ Solo zona para contexto (información deportiva eliminada)
      zona: partidosResult.rows[0]?.zona_nombre,
      zona_nombre: partidosResult.rows[0]?.zona_nombre,
    };

    // Obtener todos los detalles usando servicios modulares
    // ✅ ACTUALIZADO: getEquiposByPlanilla ahora obtiene automáticamente TODOS los equipos de TODOS los partidos
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
// ⚠️ DEPRECADO - Ahora las cajas se crean automáticamente
// desde partidosModel al guardar partidos
// ========================================
export const createPlanilla = async (
  idfecha: number
): Promise<PlanillaPago> => {
  try {
    // Verificar si ya existe
    const existeQuery = `SELECT id FROM wtorneos_fechas WHERE id = $1`;
    const existe = await pool.query(existeQuery, [idfecha]);

    if (existe.rows.length > 0) {
      throw new Error("Ya existe una planilla para este idfecha");
    }

    // Obtener datos del partido usando idfecha
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
    const equipos = await equiposService.getEquiposByPlanilla(idfecha);
    const arbitros = await arbitrosService.getArbitrosByPlanilla(idfecha);
    const canchas = await canchasService.getCanchasByPlanilla(idfecha);
    const profesores = await profesoresService.getProfesoresByPlanilla(idfecha);
    const medico = await medicosService.getMedicoByPlanilla(idfecha);
    const otros_gastos = await otrosGastosService.getOtrosGastosByPlanilla(
      idfecha
    );

    const totales = calcularTotales(
      equipos,
      arbitros,
      canchas,
      profesores,
      medico,
      otros_gastos
    );

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

export const updateTurno = async (
  idfecha: number,
  idturno: number | null
): Promise<void> => {
  try {
    const query = `
      UPDATE wtorneos_fechas 
      SET idturno = $1
      WHERE id = $2
    `;
    await pool.query(query, [idturno, idfecha]);
  } catch (error) {
    console.error("Error en updateTurno:", error);
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
