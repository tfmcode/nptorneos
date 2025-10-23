import { pool } from "../config/db";
import {
  PlanillaPago,
  PlanillaCompleta,
  PlanillaEquipo,
  PlanillaArbitro,
  PlanillaCancha,
  PlanillaProfesor,
  PlanillaMedico,
  PlanillaOtroGasto,
  PlanillasFiltros,
  PlanillaPagoListado,
} from "../types/planillasPago";

// ========================================
// PLANILLA PRINCIPAL
// ========================================

export const getPlanillasByFiltros = async (
  filtros: PlanillasFiltros
): Promise<PlanillaPagoListado[]> => {
  let query = `
    SELECT DISTINCT
      wfe.id,
      wfe.fecha,
      s.nombre as sede,
      ss.nombre as subsede,
      t.nombre as torneo,
      CONCAT(p.apellido, ' ', p.nombres) as profesor,
      CASE 
        WHEN wfe.fhcierrecaja IS NOT NULL THEN 'contabilizada'
        WHEN wfe.fhcierre IS NOT NULL THEN 'cerrada'
        ELSE 'abierta'
      END as estado,
      wfe.totcierre as total_caja
    FROM wfechas_equipos wfe
    LEFT JOIN wsedes s ON wfe.idsede = s.id
    LEFT JOIN wsedes ss ON wfe.idsubsede = ss.id
    LEFT JOIN wtorneos t ON wfe.idtorneo = t.id
    LEFT JOIN proveedores p ON wfe.idprofesor_cierre = p.id
    WHERE wfe.fhbaja IS NULL
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (filtros.idtorneo) {
    query += ` AND wfe.idtorneo = $${paramIndex}`;
    params.push(filtros.idtorneo);
    paramIndex++;
  }

  if (filtros.fecha_desde) {
    query += ` AND wfe.fecha >= $${paramIndex}`;
    params.push(filtros.fecha_desde);
    paramIndex++;
  }

  if (filtros.fecha_hasta) {
    query += ` AND wfe.fecha <= $${paramIndex}`;
    params.push(filtros.fecha_hasta);
    paramIndex++;
  }

  if (filtros.idsede) {
    query += ` AND wfe.idsede = $${paramIndex}`;
    params.push(filtros.idsede);
    paramIndex++;
  }

  if (filtros.estado) {
    if (filtros.estado === "abierta") {
      query += ` AND wfe.fhcierre IS NULL`;
    } else if (filtros.estado === "cerrada") {
      query += ` AND wfe.fhcierre IS NOT NULL AND wfe.fhcierrecaja IS NULL`;
    } else if (filtros.estado === "contabilizada") {
      query += ` AND wfe.fhcierrecaja IS NOT NULL`;
    }
  }

  query += ` ORDER BY wfe.fecha DESC, wfe.id DESC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

export const getPlanillaById = async (
  id: number
): Promise<PlanillaPago | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM wfechas_equipos WHERE id = $1 AND fhbaja IS NULL`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getPlanillaByIdFecha = async (
  idfecha: number
): Promise<PlanillaPago | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM wfechas_equipos WHERE idfecha = $1 AND fhbaja IS NULL LIMIT 1`,
    [idfecha]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const createPlanilla = async (
  planilla: Partial<PlanillaPago>
): Promise<PlanillaPago> => {
  const {
    idfecha,
    fecha,
    idsede,
    idsubsede,
    idtorneo,
    codfecha,
    idprofesor,
    idturno,
    observ,
  } = planilla;

  const { rows } = await pool.query(
    `INSERT INTO wfechas_equipos 
    (idfecha, fecha, idsede, idsubsede, idtorneo, codfecha, idprofesor, idturno, observ, fhcarga)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    RETURNING *`,
    [
      idfecha,
      fecha,
      idsede,
      idsubsede || null,
      idtorneo,
      codfecha || null,
      idprofesor || null,
      idturno || null,
      observ || null,
    ]
  );

  return rows[0];
};

export const updatePlanilla = async (
  id: number,
  planilla: Partial<PlanillaPago>
): Promise<PlanillaPago | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  const allowedFields = [
    "fecha",
    "idsede",
    "idsubsede",
    "idtorneo",
    "codfecha",
    "idprofesor",
    "idturno",
    "observ",
    "observ_caja",
    "totcierre",
    "totefectivo",
    "idprofesor_cierre",
  ];

  for (const key of allowedFields) {
    if (planilla[key as keyof PlanillaPago] !== undefined) {
      updates.push(`${key} = $${index}`);
      values.push(planilla[key as keyof PlanillaPago]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay campos para actualizar.");
  }

  values.push(id);
  const query = `UPDATE wfechas_equipos SET ${updates.join(
    ", "
  )} WHERE id = $${index} RETURNING *`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const cerrarPlanilla = async (
  id: number
): Promise<PlanillaPago | null> => {
  const { rows } = await pool.query(
    `UPDATE wfechas_equipos 
    SET fhcierre = NOW() 
    WHERE id = $1 
    RETURNING *`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const contabilizarPlanilla = async (
  id: number,
  idusuario: number
): Promise<PlanillaPago | null> => {
  const { rows } = await pool.query(
    `UPDATE wfechas_equipos 
    SET fhcierrecaja = NOW(), idusrcierrecaja = $2
    WHERE id = $1 AND fhcierre IS NOT NULL
    RETURNING *`,
    [id, idusuario]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const deletePlanilla = async (id: number): Promise<boolean> => {
  const result = await pool.query(
    `UPDATE wfechas_equipos SET fhbaja = NOW() WHERE id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
};

// ========================================
// EQUIPOS
// ========================================

export const getEquiposByPlanilla = async (
  idfecha: number
): Promise<PlanillaEquipo[]> => {
  const { rows } = await pool.query(
    `SELECT 
      wfe.*,
      e.nombre as nombre_equipo
    FROM wfechas_equipos wfe
    LEFT JOIN wequipos e ON wfe.idequipo = e.id
    WHERE wfe.idfecha = $1 AND wfe.idequipo IS NOT NULL
    ORDER BY wfe.orden`,
    [idfecha]
  );
  return rows;
};

export const saveEquipoPlanilla = async (
  equipo: Partial<PlanillaEquipo>
): Promise<PlanillaEquipo> => {
  const { idfecha, orden, idequipo, tipopago, importe, iddeposito } = equipo;

  // Verificar si existe
  const existing = await pool.query(
    `SELECT id FROM wfechas_equipos WHERE idfecha = $1 AND orden = $2 AND idequipo = $3`,
    [idfecha, orden, idequipo]
  );

  if (existing.rows.length > 0) {
    // Actualizar
    const { rows } = await pool.query(
      `UPDATE wfechas_equipos 
      SET tipopago = $1, importe = $2, iddeposito = $3
      WHERE idfecha = $4 AND orden = $5 AND idequipo = $6
      RETURNING *`,
      [tipopago, importe, iddeposito || null, idfecha, orden, idequipo]
    );
    return rows[0];
  } else {
    // Insertar
    const { rows } = await pool.query(
      `INSERT INTO wfechas_equipos 
      (idfecha, orden, idequipo, tipopago, importe, iddeposito, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *`,
      [idfecha, orden, idequipo, tipopago, importe, iddeposito || null]
    );
    return rows[0];
  }
};

export const deleteEquipoPlanilla = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM wfechas_equipos WHERE idfecha = $1 AND orden = $2 AND idequipo IS NOT NULL`,
    [idfecha, orden]
  );
  return (result.rowCount ?? 0) > 0;
};

// ========================================
// ÁRBITROS
// ========================================

export const getArbitrosByPlanilla = async (
  idfecha: number
): Promise<PlanillaArbitro[]> => {
  const { rows } = await pool.query(
    `SELECT 
      fa.*,
      CONCAT(p.apellido, ' ', p.nombres) as nombre_arbitro
    FROM fechas_arbitros fa
    LEFT JOIN proveedores p ON fa.idarbitro = p.id
    WHERE fa.idfecha = $1
    ORDER BY fa.orden`,
    [idfecha]
  );
  return rows;
};

export const saveArbitroPlanilla = async (
  arbitro: Partial<PlanillaArbitro>
): Promise<PlanillaArbitro> => {
  const { idfecha, orden, idarbitro, idprofesor, partidos, valor_partido } =
    arbitro;
  const total = (partidos || 0) * (valor_partido || 0);

  // Verificar si existe
  const existing = await pool.query(
    `SELECT 1 FROM fechas_arbitros WHERE idfecha = $1 AND orden = $2`,
    [idfecha, orden]
  );

  if (existing.rows.length > 0) {
    // Actualizar
    const { rows } = await pool.query(
      `UPDATE fechas_arbitros 
      SET idarbitro = $1, idprofesor = $2, partidos = $3, valor_partido = $4, total = $5
      WHERE idfecha = $6 AND orden = $7
      RETURNING *`,
      [
        idarbitro,
        idprofesor || null,
        partidos,
        valor_partido,
        total,
        idfecha,
        orden,
      ]
    );
    return rows[0];
  } else {
    // Insertar
    const { rows } = await pool.query(
      `INSERT INTO fechas_arbitros 
      (idfecha, orden, idarbitro, idprofesor, partidos, valor_partido, total, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [
        idfecha,
        orden,
        idarbitro,
        idprofesor || null,
        partidos,
        valor_partido,
        total,
      ]
    );
    return rows[0];
  }
};

export const deleteArbitroPlanilla = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM fechas_arbitros WHERE idfecha = $1 AND orden = $2`,
    [idfecha, orden]
  );
  return (result.rowCount ?? 0) > 0;
};

// ========================================
// CANCHAS
// ========================================

export const getCanchasByPlanilla = async (
  idfecha: number
): Promise<PlanillaCancha[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM fechas_canchas WHERE idfecha = $1 ORDER BY orden`,
    [idfecha]
  );
  return rows;
};

export const saveCanchaPlanilla = async (
  cancha: Partial<PlanillaCancha>
): Promise<PlanillaCancha> => {
  const { idfecha, orden, horas, valor_hora } = cancha;
  const total = (horas || 0) * (valor_hora || 0);

  const existing = await pool.query(
    `SELECT 1 FROM fechas_canchas WHERE idfecha = $1 AND orden = $2`,
    [idfecha, orden]
  );

  if (existing.rows.length > 0) {
    const { rows } = await pool.query(
      `UPDATE fechas_canchas 
      SET horas = $1, valor_hora = $2, total = $3
      WHERE idfecha = $4 AND orden = $5
      RETURNING *`,
      [horas, valor_hora, total, idfecha, orden]
    );
    return rows[0];
  } else {
    const { rows } = await pool.query(
      `INSERT INTO fechas_canchas 
      (idfecha, orden, horas, valor_hora, total, fhcarga)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
      [idfecha, orden, horas, valor_hora, total]
    );
    return rows[0];
  }
};

export const deleteCanchaPlanilla = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM fechas_canchas WHERE idfecha = $1 AND orden = $2`,
    [idfecha, orden]
  );
  return (result.rowCount ?? 0) > 0;
};

// ========================================
// PROFESORES
// ========================================

export const getProfesoresByPlanilla = async (
  idfecha: number
): Promise<PlanillaProfesor[]> => {
  const { rows } = await pool.query(
    `SELECT 
      fp.*,
      CONCAT(p.apellido, ' ', p.nombres) as nombre_profesor
    FROM fechas_profes fp
    LEFT JOIN proveedores p ON fp.idprofesor = p.id
    WHERE fp.idfecha = $1
    ORDER BY fp.orden`,
    [idfecha]
  );
  return rows;
};

export const saveProfesorPlanilla = async (
  profesor: Partial<PlanillaProfesor>
): Promise<PlanillaProfesor> => {
  const { idfecha, orden, idprofesor, horas, valor_hora } = profesor;
  const total = (horas || 0) * (valor_hora || 0);

  const existing = await pool.query(
    `SELECT 1 FROM fechas_profes WHERE idfecha = $1 AND orden = $2`,
    [idfecha, orden]
  );

  if (existing.rows.length > 0) {
    const { rows } = await pool.query(
      `UPDATE fechas_profes 
      SET idprofesor = $1, horas = $2, valor_hora = $3, total = $4
      WHERE idfecha = $5 AND orden = $6
      RETURNING *`,
      [idprofesor, horas, valor_hora, total, idfecha, orden]
    );
    return rows[0];
  } else {
    const { rows } = await pool.query(
      `INSERT INTO fechas_profes 
      (idfecha, orden, idprofesor, horas, valor_hora, total, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *`,
      [idfecha, orden, idprofesor, horas, valor_hora, total]
    );
    return rows[0];
  }
};

export const deleteProfesorPlanilla = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM fechas_profes WHERE idfecha = $1 AND orden = $2`,
    [idfecha, orden]
  );
  return (result.rowCount ?? 0) > 0;
};

// ========================================
// SERVICIO MÉDICO
// ========================================

export const getMedicosByPlanilla = async (
  idfecha: number
): Promise<PlanillaMedico[]> => {
  const { rows } = await pool.query(
    `SELECT 
      fm.*,
      CONCAT(p.apellido, ' ', p.nombres) as nombre_medico
    FROM fechas_medico fm
    LEFT JOIN proveedores p ON fm.idmedico = p.id
    WHERE fm.idfecha = $1
    ORDER BY fm.orden`,
    [idfecha]
  );
  return rows;
};

export const saveMedicoPlanilla = async (
  medico: Partial<PlanillaMedico>
): Promise<PlanillaMedico> => {
  const { idfecha, orden, idmedico, horas, valor_hora } = medico;
  const total = (horas || 0) * (valor_hora || 0);

  const existing = await pool.query(
    `SELECT 1 FROM fechas_medico WHERE idfecha = $1 AND orden = $2`,
    [idfecha, orden]
  );

  if (existing.rows.length > 0) {
    const { rows } = await pool.query(
      `UPDATE fechas_medico 
      SET idmedico = $1, horas = $2, valor_hora = $3, total = $4
      WHERE idfecha = $5 AND orden = $6
      RETURNING *`,
      [idmedico, horas, valor_hora, total, idfecha, orden]
    );
    return rows[0];
  } else {
    const { rows } = await pool.query(
      `INSERT INTO fechas_medico 
      (idfecha, orden, idmedico, horas, valor_hora, total, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *`,
      [idfecha, orden, idmedico, horas, valor_hora, total]
    );
    return rows[0];
  }
};

export const deleteMedicoPlanilla = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM fechas_medico WHERE idfecha = $1 AND orden = $2`,
    [idfecha, orden]
  );
  return (result.rowCount ?? 0) > 0;
};

// ========================================
// OTROS GASTOS
// ========================================

export const getOtrosGastosByPlanilla = async (
  idfecha: number
): Promise<PlanillaOtroGasto[]> => {
  const { rows } = await pool.query(
    `SELECT 
      fo.*,
      c.descripcion as descripcion_gasto
    FROM fechas_otros fo
    LEFT JOIN codificadores c ON fo.codgasto = c.id
    WHERE fo.idfecha = $1
    ORDER BY fo.orden`,
    [idfecha]
  );
  return rows;
};

export const saveOtroGastoPlanilla = async (
  gasto: Partial<PlanillaOtroGasto>
): Promise<PlanillaOtroGasto> => {
  const { idfecha, orden, codgasto, idprofesor, cantidad, valor_unidad } =
    gasto;
  const total = (cantidad || 0) * (valor_unidad || 0);

  const existing = await pool.query(
    `SELECT 1 FROM fechas_otros WHERE idfecha = $1 AND orden = $2`,
    [idfecha, orden]
  );

  if (existing.rows.length > 0) {
    const { rows } = await pool.query(
      `UPDATE fechas_otros 
      SET codgasto = $1, idprofesor = $2, cantidad = $3, valor_unidad = $4, total = $5
      WHERE idfecha = $6 AND orden = $7
      RETURNING *`,
      [
        codgasto,
        idprofesor || null,
        cantidad,
        valor_unidad,
        total,
        idfecha,
        orden,
      ]
    );
    return rows[0];
  } else {
    const { rows } = await pool.query(
      `INSERT INTO fechas_otros 
      (idfecha, orden, codgasto, idprofesor, cantidad, valor_unidad, total, fhcarga)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [
        idfecha,
        orden,
        codgasto,
        idprofesor || null,
        cantidad,
        valor_unidad,
        total,
      ]
    );
    return rows[0];
  }
};

export const deleteOtroGastoPlanilla = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM fechas_otros WHERE idfecha = $1 AND orden = $2`,
    [idfecha, orden]
  );
  return (result.rowCount ?? 0) > 0;
};

// ========================================
// OBTENER PLANILLA COMPLETA
// ========================================

export const getPlanillaCompleta = async (
  idfecha: number
): Promise<PlanillaCompleta | null> => {
  const planilla = await getPlanillaByIdFecha(idfecha);
  if (!planilla) return null;

  const equipos = await getEquiposByPlanilla(idfecha);
  const arbitros = await getArbitrosByPlanilla(idfecha);
  const canchas = await getCanchasByPlanilla(idfecha);
  const profesores = await getProfesoresByPlanilla(idfecha);
  const medico = await getMedicosByPlanilla(idfecha);
  const otros_gastos = await getOtrosGastosByPlanilla(idfecha);

  // Calcular totales
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

  const egreso_arbitros = arbitros.reduce((sum, a) => sum + (a.total || 0), 0);
  const egreso_canchas = canchas.reduce((sum, c) => sum + (c.total || 0), 0);
  const egreso_profesores = profesores.reduce(
    (sum, p) => sum + (p.total || 0),
    0
  );
  const egreso_medico = medico.reduce((sum, m) => sum + (m.total || 0), 0);
  const egreso_otros = otros_gastos.reduce((sum, o) => sum + (o.total || 0), 0);

  const total_egresos =
    egreso_arbitros +
    egreso_canchas +
    egreso_profesores +
    egreso_medico +
    egreso_otros;

  const total_caja = total_ingresos - total_egresos;
  const total_efectivo = planilla.totefectivo || 0;
  const diferencia_caja = total_efectivo - total_caja;

  return {
    planilla,
    equipos,
    arbitros,
    canchas,
    profesores,
    medico,
    otros_gastos,
    totales: {
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
    },
  };
};
