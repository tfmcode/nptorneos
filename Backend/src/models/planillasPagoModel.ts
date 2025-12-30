import { pool } from "../config/db";
import {
  PlanillaPago,
  PlanillaCompleta,
  PlanillasFiltros,
} from "../types/planillasPago";

import * as equiposService from "./planillas/equiposService";
import * as arbitrosService from "./planillas/arbitrosService";
import * as canchasService from "./planillas/canchasService";
import * as profesoresService from "./planillas/profesoresService";
import * as medicosService from "./planillas/medicosService";
import * as otrosGastosService from "./planillas/otrosGastosService";
import { calcularTotales } from "./planillas/utils";

export const getEquiposByPlanilla = equiposService.getEquiposByPlanilla;
export const addEquipo = equiposService.addEquipo;
export const updateEquipo = equiposService.updateEquipo;
export const deleteEquipo = equiposService.deleteEquipo;
export const toggleAusencia = equiposService.toggleAusencia;
export const updatePagoFecha = equiposService.updatePagoFecha;
export const updatePagoInscripcion = equiposService.updatePagoInscripcion;
export const updatePagoDeposito = equiposService.updatePagoDeposito;

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

export const getPlanillasByFiltros = async (
  filtros: PlanillasFiltros
): Promise<PlanillaPago[]> => {
  try {
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
        prov.nombre as profesor_nombre,
        cod.descripcion as turno_nombre,
        CASE 
          WHEN wtf.fhcierrecaja IS NOT NULL THEN 'contabilizada'
          WHEN wtf.fhcierre IS NOT NULL THEN 'cerrada'
          ELSE 'abierta'
        END as estado,
        (SELECT COUNT(*) FROM partidos p 
         WHERE p.idfecha = wtf.id AND p.fhbaja IS NULL) as cantidad_partidos,
        (SELECT z.nombre FROM partidos p 
         INNER JOIN zonas z ON p.idzona = z.id
         WHERE p.idfecha = wtf.id AND p.fhbaja IS NULL 
         LIMIT 1) as zona_nombre
      FROM wtorneos_fechas wtf
      LEFT JOIN wsedes s ON wtf.idsede = s.id
      LEFT JOIN wtorneos t ON wtf.idtorneo = t.id
      LEFT JOIN proveedores prov ON wtf.idprofesor = prov.id
      LEFT JOIN codificadores cod ON wtf.idturno = cod.id AND cod.idcodificador = 7
      WHERE wtf.fhbaja IS NULL
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filtros.idtorneo) {
      query += ` AND wtf.idtorneo = $${paramIndex}`;
      params.push(filtros.idtorneo);
      paramIndex++;
    }

    if (filtros.idsede) {
      query += ` AND wtf.idsede = $${paramIndex}`;
      params.push(filtros.idsede);
      paramIndex++;
    }

    if (filtros.fecha_desde) {
      query += ` AND wtf.fecha >= $${paramIndex}`;
      params.push(filtros.fecha_desde);
      paramIndex++;
    }

    if (filtros.fecha_hasta) {
      query += ` AND wtf.fecha <= $${paramIndex}`;
      params.push(filtros.fecha_hasta);
      paramIndex++;
    }

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
      profesor_nombre: row.profesor_nombre,
      idturno: row.idturno,
      turno_nombre: row.turno_nombre,
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

export const getPlanillaByIdFecha = async (
  idfecha: number
): Promise<PlanillaCompleta | null> => {
  try {
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
        prov.nombre as profesor_nombre,
        prov_cierre.nombre as profesor_cierre_nombre,
        cod.descripcion as turno_nombre
      FROM wtorneos_fechas wtf
      LEFT JOIN wsedes s ON wtf.idsede = s.id
      LEFT JOIN wtorneos t ON wtf.idtorneo = t.id
      LEFT JOIN proveedores prov ON wtf.idprofesor = prov.id
      LEFT JOIN proveedores prov_cierre ON wtf.idprofesor_cierre = prov_cierre.id
      LEFT JOIN codificadores cod ON wtf.idturno = cod.id AND cod.idcodificador = 7
      WHERE wtf.id = $1
    `;

    const planillaResult = await pool.query(planillaQuery, [idfecha]);

    if (planillaResult.rows.length === 0) {
      return null;
    }

    const row = planillaResult.rows[0];

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
      profesor_nombre: row.profesor_nombre,
      idprofesor_cierre: row.idprofesor_cierre,
      profesor_cierre_nombre: row.profesor_cierre_nombre,
      idturno: row.idturno || undefined,
      turno_nombre: row.turno_nombre,
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
      zona: partidosResult.rows[0]?.zona_nombre,
      zona_nombre: partidosResult.rows[0]?.zona_nombre,
    };

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

export const createPlanilla = async (
  idfecha: number
): Promise<PlanillaPago> => {
  try {
    const existeQuery = `SELECT id FROM wtorneos_fechas WHERE id = $1`;
    const existe = await pool.query(existeQuery, [idfecha]);

    if (existe.rows.length > 0) {
      throw new Error("Ya existe una planilla para este idfecha");
    }

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

export const cerrarPlanilla = async (
  idfecha: number,
  idprofesor: number
): Promise<void> => {
  try {
    await recalcularTotalesPlanilla(idfecha);

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

export const reabrirPlanilla = async (idfecha: number): Promise<void> => {
  try {
    const query = `
      UPDATE wtorneos_fechas 
      SET fhcierre = NULL, idprofesor_cierre = NULL, fhcierrecaja = NULL, idusrcierrecaja = NULL
      WHERE id = $1
    `;
    await pool.query(query, [idfecha]);
  } catch (error) {
    console.error("Error en reabrirPlanilla:", error);
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

export const updateEfectivoReal = async (
  idfecha: number,
  totefectivo: number
): Promise<void> => {
  try {
    const query = `
      UPDATE wtorneos_fechas
      SET totefectivo = $1
      WHERE id = $2
    `;
    await pool.query(query, [totefectivo, idfecha]);
  } catch (error) {
    console.error("Error en updateEfectivoReal:", error);
    throw error;
  }
};

export const cerrarCaja = async (
  idfecha: number,
  idusuario: number
): Promise<void> => {
  try {
    await recalcularTotalesPlanilla(idfecha);

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
