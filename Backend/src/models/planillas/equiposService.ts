import { pool } from "../../config/db";
import { PlanillaEquipo } from "../../types/planillasPago";

export const getEquiposByPlanilla = async (
  idfecha: number
): Promise<PlanillaEquipo[]> => {
  try {
    // 1. Obtener el idtorneo de la fecha
    const torneoQuery = `SELECT idtorneo FROM wtorneos_fechas WHERE id = $1`;
    const torneoResult = await pool.query(torneoQuery, [idfecha]);
    if (torneoResult.rows.length === 0) {
      return [];
    }
    const idtorneo = torneoResult.rows[0].idtorneo;

    // 2. Obtener partidos y equipos de esta fecha
    const partidosQuery = `
      SELECT
        p.id as partido_id,
        p.idequipo1,
        p.idequipo2,
        p.idzona,
        e1.nombre as nombre_equipo1,
        e2.nombre as nombre_equipo2,
        z.idtorneo,
        COALESCE(ze1.valor_fecha, t.valor_fecha, 0) as valor_fecha_eq1,
        COALESCE(ze2.valor_fecha, t.valor_fecha, 0) as valor_fecha_eq2
      FROM partidos p
      LEFT JOIN wequipos e1 ON p.idequipo1 = e1.id
      LEFT JOIN wequipos e2 ON p.idequipo2 = e2.id
      LEFT JOIN zonas z ON p.idzona = z.id
      LEFT JOIN wtorneos t ON z.idtorneo = t.id
      LEFT JOIN zonas_equipos ze1
        ON ze1.idzona = p.idzona
        AND ze1.idequipo = p.idequipo1
        AND ze1.fhbaja IS NULL
      LEFT JOIN zonas_equipos ze2
        ON ze2.idzona = p.idzona
        AND ze2.idequipo = p.idequipo2
        AND ze2.fhbaja IS NULL
      WHERE p.idfecha = $1 AND p.fhbaja IS NULL
      ORDER BY p.id
    `;

    const partidosResult = await pool.query(partidosQuery, [idfecha]);

    if (partidosResult.rows.length === 0) {
      return [];
    }

    const equiposMap = new Map<
      number,
      {
        nombre: string;
        idtorneo: number;
        valor_fecha: number;
        cantidad_partidos: number;
      }
    >();

    partidosResult.rows.forEach((partido: any) => {
      if (partido.idequipo1) {
        const existing = equiposMap.get(partido.idequipo1);
        equiposMap.set(partido.idequipo1, {
          nombre: partido.nombre_equipo1 || `Equipo ${partido.idequipo1}`,
          idtorneo: partido.idtorneo,
          valor_fecha: parseFloat(partido.valor_fecha_eq1 || "0"),
          cantidad_partidos: (existing?.cantidad_partidos || 0) + 1,
        });
      }

      if (partido.idequipo2) {
        const existing = equiposMap.get(partido.idequipo2);
        equiposMap.set(partido.idequipo2, {
          nombre: partido.nombre_equipo2 || `Equipo ${partido.idequipo2}`,
          idtorneo: partido.idtorneo,
          valor_fecha: parseFloat(partido.valor_fecha_eq2 || "0"),
          cantidad_partidos: (existing?.cantidad_partidos || 0) + 1,
        });
      }
    });

    // 3. Obtener ausencias
    const ausenciasQuery = `
      SELECT idequipo FROM wfechas_equipos_aus
      WHERE idfecha = $1
    `;
    const ausenciasResult = await pool.query(ausenciasQuery, [idfecha]);
    const equiposAusentes = new Set(
      ausenciasResult.rows.map((r: any) => r.idequipo)
    );

    const idsEquipos = Array.from(equiposMap.keys());

    // 4. SALDO INSCRIPCIÓN - DEBE: wtorneos_equipos_insc.inscrip, HABER: SUM(wfechas_equipos WHERE tipopago=1)
    const saldoInscripcionQuery = `
      SELECT
        e.id as idequipo,
        COALESCE((
          SELECT COALESCE(SUM(tei.inscrip), 0)
          FROM wtorneos_equipos_insc tei
          WHERE tei.idequipo = e.id AND tei.idtorneo = $2
        ), 0) as debe_insc,
        COALESCE((
          SELECT COALESCE(SUM(fe.importe), 0)
          FROM wfechas_equipos fe
          INNER JOIN wtorneos_fechas wtf ON fe.idfecha = wtf.id
          WHERE fe.idequipo = e.id
            AND fe.tipopago = 1
            AND wtf.fhbaja IS NULL
            AND fe.importe > 0
            AND wtf.idtorneo = $2
            AND fe.idfecha != $3
        ), 0) as haber_insc
      FROM wequipos e
      WHERE e.id = ANY($1) AND e.fhbaja IS NULL
    `;
    const saldoInscResult = await pool.query(saldoInscripcionQuery, [idsEquipos, idtorneo, idfecha]);
    const saldoInscMap = new Map(
      saldoInscResult.rows.map((r: any) => [
        r.idequipo,
        {
          debe: parseFloat(r.debe_insc || "0"),
          haber: parseFloat(r.haber_insc || "0"),
        },
      ])
    );

    // 5. SALDO FECHAS ANTERIORES - DEBE: wfechas_equipos_hab, HABER: wfechas_equipos WHERE tipopago=3
    const saldoFechasAntQuery = `
      SELECT
        e.id as idequipo,
        COALESCE((
          SELECT COALESCE(SUM(feh.importe), 0)
          FROM wfechas_equipos_hab feh
          INNER JOIN wtorneos t ON feh.idtorneo = t.id
          WHERE feh.idequipo = e.id
            AND feh.importe > 0
            AND t.fhbaja IS NULL
            AND feh.idtorneo = $2
            AND feh.idfecha != $3
        ), 0) as debe_fecha_ant,
        COALESCE((
          SELECT COALESCE(SUM(fe.importe), 0)
          FROM wfechas_equipos fe
          INNER JOIN wtorneos_fechas wtf ON fe.idfecha = wtf.id
          WHERE fe.idequipo = e.id
            AND fe.tipopago = 3
            AND wtf.fhbaja IS NULL
            AND fe.importe > 0
            AND wtf.idtorneo = $2
            AND fe.idfecha != $3
        ), 0) as haber_fecha_ant
      FROM wequipos e
      WHERE e.id = ANY($1) AND e.fhbaja IS NULL
    `;
    const saldoFechasAntResult = await pool.query(saldoFechasAntQuery, [idsEquipos, idtorneo, idfecha]);
    const saldoFechasAntMap = new Map(
      saldoFechasAntResult.rows.map((r: any) => [
        r.idequipo,
        {
          debe: parseFloat(r.debe_fecha_ant || "0"),
          haber: parseFloat(r.haber_fecha_ant || "0"),
        },
      ])
    );

    // 6. SALDO DEPÓSITO - DEBE: wdepositos codtipo=2, HABER: wdepositos codtipo=1
    const saldoDepositoQuery = `
      SELECT
        e.id as idequipo,
        COALESCE((
          SELECT COALESCE(SUM(d.importe), 0)
          FROM wdepositos d
          WHERE d.idequipo = e.id
            AND d.codtipo = 2
            AND d.fhbaja IS NULL
            AND d.importe > 0
        ), 0) as debe_dep,
        COALESCE((
          SELECT COALESCE(SUM(d.importe), 0)
          FROM wdepositos d
          WHERE d.idequipo = e.id
            AND d.codtipo = 1
            AND d.fhbaja IS NULL
            AND d.importe > 0
        ), 0) as haber_dep
      FROM wequipos e
      WHERE e.id = ANY($1) AND e.fhbaja IS NULL
    `;
    const saldoDepResult = await pool.query(saldoDepositoQuery, [idsEquipos]);
    const saldoDepMap = new Map(
      saldoDepResult.rows.map((r: any) => [
        r.idequipo,
        {
          debe: parseFloat(r.debe_dep || "0"),
          haber: parseFloat(r.haber_dep || "0"),
        },
      ])
    );

    // 7. Pagos de ESTA fecha (para mostrar en las celdas editables)
    const pagosQuery = `
      SELECT
        idequipo,
        tipopago,
        SUM(importe) as total_pago
      FROM wfechas_equipos
      WHERE idfecha = $1
      GROUP BY idequipo, tipopago
    `;
    const pagosResult = await pool.query(pagosQuery, [idfecha]);

    const pagosMap = new Map<
      number,
      { pago_ins: number; pago_fecha: number; pago_descuento: number }
    >();
    pagosResult.rows.forEach((r: any) => {
      const idequipo = r.idequipo;
      const existing = pagosMap.get(idequipo) || {
        pago_ins: 0,
        pago_fecha: 0,
        pago_descuento: 0,
      };

      if (r.tipopago === 1) existing.pago_ins = parseFloat(r.total_pago || "0");
      if (r.tipopago === 3) existing.pago_fecha = parseFloat(r.total_pago || "0");
      if (r.tipopago === 4) existing.pago_descuento = parseFloat(r.total_pago || "0");

      pagosMap.set(idequipo, existing);
    });

    // 8. Pagos de depósito de ESTA fecha (de wdepositos)
    const pagosDepQuery = `
      SELECT
        d.idequipo,
        SUM(d.importe) as total_pago_dep
      FROM wdepositos d
      WHERE d.idequipo = ANY($1)
        AND d.codtipo = 1
        AND d.fhbaja IS NULL
        AND d.idfecha = $2
      GROUP BY d.idequipo
    `;
    const pagosDepResult = await pool.query(pagosDepQuery, [idsEquipos, idfecha]);
    const pagosDepMap = new Map(
      pagosDepResult.rows.map((r: any) => [
        r.idequipo,
        parseFloat(r.total_pago_dep || "0"),
      ])
    );

    // 9. Construir resultado
    const equipos: PlanillaEquipo[] = [];
    let orden = 1;

    equiposMap.forEach((data, idequipo) => {
      const ausente = equiposAusentes.has(idequipo);
      const pagos = pagosMap.get(idequipo) || {
        pago_ins: 0,
        pago_fecha: 0,
        pago_descuento: 0,
      };
      const pagoDepEstaFecha = pagosDepMap.get(idequipo) || 0;

      // Saldos calculados según modelo contable
      const saldoInsc = saldoInscMap.get(idequipo) || { debe: 0, haber: 0 };
      const saldoFechasAnt = saldoFechasAntMap.get(idequipo) || { debe: 0, haber: 0 };
      const saldoDep = saldoDepMap.get(idequipo) || { debe: 0, haber: 0 };

      // Deuda de inscripción = DEBE - HABER (sin contar pago de esta fecha)
      const deudaInscPendiente = Math.max(0, saldoInsc.debe - saldoInsc.haber);

      // Deuda de fechas anteriores = DEBE - HABER
      const deudaFechasAntPendiente = Math.max(0, saldoFechasAnt.debe - saldoFechasAnt.haber);

      // Deuda de depósito = DEBE - HABER (sin contar pago de esta fecha)
      // Restamos pagoDepEstaFecha porque ya está en haber total
      const deudaDepPendiente = Math.max(0, saldoDep.debe - (saldoDep.haber - pagoDepEstaFecha));

      // Deuda de ESTA fecha específica (valor_fecha * cantidad_partidos)
      const deuda_fecha = data.valor_fecha * data.cantidad_partidos;

      // Total a pagar = inscripción pendiente + depósito pendiente + fechas anteriores + esta fecha
      const total_pagar = deudaInscPendiente + deudaDepPendiente + deudaFechasAntPendiente + deuda_fecha;

      // Total pagado esta fecha (incluyendo descuentos como pagos)
      const total_pagado_esta_fecha =
        pagos.pago_ins + pagoDepEstaFecha + pagos.pago_fecha + pagos.pago_descuento;
      const deuda_total = total_pagar - total_pagado_esta_fecha;

      equipos.push({
        idfecha,
        orden: orden++,
        idequipo,
        nombre_equipo: data.nombre,
        ausente: ausente ? 1 : 0,
        cantidad_partidos: data.cantidad_partidos,

        deuda_insc: deudaInscPendiente,
        deuda_dep: deudaDepPendiente,
        deuda_fecha_ant: deudaFechasAntPendiente, // Nueva columna para deuda de fechas anteriores
        deuda_fecha,
        total_pagar,

        pago_ins: pagos.pago_ins,
        pago_dep: pagoDepEstaFecha,
        pago_fecha: pagos.pago_fecha,
        pago_descuento: pagos.pago_descuento, // Nuevo campo para descuentos

        deuda_total,

        tipopago: 0,
        importe: 0,
      });
    });

    return equipos.sort((a, b) => a.orden - b.orden);
  } catch (error) {
    console.error("Error en getEquiposByPlanilla:", error);
    throw error;
  }
};

export const toggleAusencia = async (
  idfecha: number,
  idequipo: number,
  ausente: boolean
): Promise<void> => {
  try {
    if (ausente) {
      await pool.query(
        `INSERT INTO wfechas_equipos_aus (idfecha, idequipo, fhcarga)
         VALUES ($1, $2, NOW())
         ON CONFLICT DO NOTHING`,
        [idfecha, idequipo]
      );
    } else {
      await pool.query(
        `DELETE FROM wfechas_equipos_aus
         WHERE idfecha = $1 AND idequipo = $2`,
        [idfecha, idequipo]
      );
    }
  } catch (error) {
    console.error("Error en toggleAusencia:", error);
    throw error;
  }
};

export const updatePagoFecha = async (
  idfecha: number,
  idequipo: number,
  importe: number
): Promise<void> => {
  try {
    await pool.query(
      `DELETE FROM wfechas_equipos
       WHERE idfecha = $1 AND idequipo = $2 AND tipopago = 3`,
      [idfecha, idequipo]
    );

    if (importe > 0) {
      await pool.query(
        `INSERT INTO wfechas_equipos (idfecha, orden, idequipo, tipopago, importe, fhcarga)
         VALUES ($1, 1, $2, 3, $3, NOW())`,
        [idfecha, idequipo, importe]
      );
    }
  } catch (error) {
    console.error("Error en updatePagoFecha:", error);
    throw error;
  }
};

export const updatePagoInscripcion = async (
  idfecha: number,
  idequipo: number,
  importe: number
): Promise<void> => {
  try {
    await pool.query(
      `DELETE FROM wfechas_equipos
       WHERE idfecha = $1 AND idequipo = $2 AND tipopago = 1`,
      [idfecha, idequipo]
    );

    if (importe > 0) {
      await pool.query(
        `INSERT INTO wfechas_equipos (idfecha, orden, idequipo, tipopago, importe, fhcarga)
         VALUES ($1, 1, $2, 1, $3, NOW())`,
        [idfecha, idequipo, importe]
      );
    }
  } catch (error) {
    console.error("Error en updatePagoInscripcion:", error);
    throw error;
  }
};

// Pago de depósito va a wdepositos con codtipo=1 (pago)
export const updatePagoDeposito = async (
  idfecha: number,
  idequipo: number,
  importe: number
): Promise<void> => {
  try {
    // Eliminar pago de depósito anterior de esta fecha
    await pool.query(
      `DELETE FROM wdepositos
       WHERE idfecha = $1 AND idequipo = $2 AND codtipo = 1`,
      [idfecha, idequipo]
    );

    if (importe > 0) {
      // Insertar nuevo pago de depósito (codtipo=1 = pago)
      await pool.query(
        `INSERT INTO wdepositos (idfecha, idequipo, codtipo, importe, fecha, fhcarga)
         VALUES ($1, $2, 1, $3, (SELECT fecha FROM wtorneos_fechas WHERE id = $1), NOW())`,
        [idfecha, idequipo, importe]
      );
    }
  } catch (error) {
    console.error("Error en updatePagoDeposito:", error);
    throw error;
  }
};

// Nuevo: Descuento va a wfechas_equipos con tipopago=4
export const updateDescuento = async (
  idfecha: number,
  idequipo: number,
  importe: number
): Promise<void> => {
  try {
    await pool.query(
      `DELETE FROM wfechas_equipos
       WHERE idfecha = $1 AND idequipo = $2 AND tipopago = 4`,
      [idfecha, idequipo]
    );

    if (importe > 0) {
      await pool.query(
        `INSERT INTO wfechas_equipos (idfecha, orden, idequipo, tipopago, importe, fhcarga)
         VALUES ($1, 1, $2, 4, $3, NOW())`,
        [idfecha, idequipo, importe]
      );
    }
  } catch (error) {
    console.error("Error en updateDescuento:", error);
    throw error;
  }
};

export const addEquipo = async (equipo: any): Promise<any> => {
  throw new Error("addEquipo deprecated - use updatePagoFecha instead");
};

export const updateEquipo = async (
  idfecha: number,
  orden: number,
  equipo: any
): Promise<any> => {
  throw new Error("updateEquipo deprecated - use updatePagoFecha instead");
};

export const deleteEquipo = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  throw new Error("deleteEquipo deprecated");
};
