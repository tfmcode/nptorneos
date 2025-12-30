import { pool } from "../../config/db";
import { PlanillaEquipo } from "../../types/planillasPago";

export const getEquiposByPlanilla = async (
  idfecha: number
): Promise<PlanillaEquipo[]> => {
  try {
    const partidosQuery = `
      SELECT
        p.id as partido_id,
        p.idequipo1,
        p.idequipo2,
        p.idzona,
        e1.nombre as nombre_equipo1,
        e2.nombre as nombre_equipo2,
        z.idtorneo,
        
        COALESCE(ze1.valor_insc, t.valor_insc, 0) as valor_insc_eq1,
        COALESCE(ze1.valor_fecha, t.valor_fecha, 0) as valor_fecha_eq1,
        
        COALESCE(ze2.valor_insc, t.valor_insc, 0) as valor_insc_eq2,
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

    const planillaQuery = `SELECT id FROM wtorneos_fechas WHERE id = $1`;
    const planillaResult = await pool.query(planillaQuery, [idfecha]);
    if (planillaResult.rows.length === 0) {
      return [];
    }

    const equiposMap = new Map<
      number,
      {
        nombre: string;
        idtorneo: number;
        valor_insc: number;
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
          valor_insc: parseFloat(partido.valor_insc_eq1 || "0"),
          valor_fecha: parseFloat(partido.valor_fecha_eq1 || "0"),
          cantidad_partidos: (existing?.cantidad_partidos || 0) + 1,
        });
      }

      if (partido.idequipo2) {
        const existing = equiposMap.get(partido.idequipo2);
        equiposMap.set(partido.idequipo2, {
          nombre: partido.nombre_equipo2 || `Equipo ${partido.idequipo2}`,
          idtorneo: partido.idtorneo,
          valor_insc: parseFloat(partido.valor_insc_eq2 || "0"),
          valor_fecha: parseFloat(partido.valor_fecha_eq2 || "0"),
          cantidad_partidos: (existing?.cantidad_partidos || 0) + 1,
        });
      }
    });

    const ausenciasQuery = `
      SELECT idequipo FROM wfechas_equipos_aus
      WHERE idfecha = $1
    `;
    const ausenciasResult = await pool.query(ausenciasQuery, [idfecha]);
    const equiposAusentes = new Set(
      ausenciasResult.rows.map((r: any) => r.idequipo)
    );

    const idsEquipos = Array.from(equiposMap.keys());

    const pagosInscripcionTotalesQuery = `
      SELECT 
        fe.idequipo,
        SUM(fe.importe) as total_pagado_insc
      FROM wfechas_equipos fe
      INNER JOIN wtorneos_fechas tf ON fe.idfecha = tf.id
      WHERE fe.idequipo = ANY($1) 
        AND fe.tipopago = 1
        AND tf.fhbaja IS NULL
      GROUP BY fe.idequipo
    `;
    const pagosInscTotalesResult = await pool.query(
      pagosInscripcionTotalesQuery,
      [idsEquipos]
    );
    const pagosInscTotalesMap = new Map(
      pagosInscTotalesResult.rows.map((r: any) => [
        r.idequipo,
        parseFloat(r.total_pagado_insc || "0"),
      ])
    );

    const saldosCuentaCorrienteQuery = `
      SELECT 
        e.id as idequipo,
        COALESCE(
          (SELECT SUM(
            CASE 
              WHEN mov.haber > 0 THEN mov.haber 
              WHEN mov.debe > 0 THEN -mov.debe 
              ELSE 0 
            END
          ) FROM winfo_ccequipos(e.id) mov),
          0
        ) as saldo_cc
      FROM wequipos e
      WHERE e.id = ANY($1) AND e.fhbaja IS NULL
    `;

    let saldosCCMap = new Map<number, number>();
    try {
      const saldosCCResult = await pool.query(saldosCuentaCorrienteQuery, [
        idsEquipos,
      ]);
      saldosCCMap = new Map(
        saldosCCResult.rows.map((r: any) => [
          r.idequipo,
          parseFloat(r.saldo_cc || "0"),
        ])
      );
    } catch (err) {
      console.log(
        "Info: Función winfo_ccequipos no disponible, usando cálculo alternativo"
      );

      const depositosPendientesQuery = `
        SELECT 
          d.idequipo,
          SUM(CASE WHEN d.codtipo = 2 THEN d.importe ELSE 0 END) as deuda_depositos,
          SUM(CASE WHEN d.codtipo = 1 THEN d.importe ELSE 0 END) as pagos_depositos
        FROM wdepositos d
        WHERE d.idequipo = ANY($1) AND d.fhbaja IS NULL
        GROUP BY d.idequipo
      `;
      const depositosResult = await pool.query(depositosPendientesQuery, [
        idsEquipos,
      ]);
      depositosResult.rows.forEach((r: any) => {
        const deuda = parseFloat(r.deuda_depositos || "0");
        const pagos = parseFloat(r.pagos_depositos || "0");
        saldosCCMap.set(r.idequipo, pagos - deuda);
      });
    }

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
      { pago_ins: number; pago_dep: number; pago_fecha: number }
    >();
    pagosResult.rows.forEach((r: any) => {
      const idequipo = r.idequipo;
      const existing = pagosMap.get(idequipo) || {
        pago_ins: 0,
        pago_dep: 0,
        pago_fecha: 0,
      };

      if (r.tipopago === 1) existing.pago_ins = parseFloat(r.total_pago || "0");
      if (r.tipopago === 2) existing.pago_dep = parseFloat(r.total_pago || "0");
      if (r.tipopago === 3)
        existing.pago_fecha = parseFloat(r.total_pago || "0");

      pagosMap.set(idequipo, existing);
    });

    const equipos: PlanillaEquipo[] = [];
    let orden = 1;

    equiposMap.forEach((data, idequipo) => {
      const ausente = equiposAusentes.has(idequipo);
      const pagos = pagosMap.get(idequipo) || {
        pago_ins: 0,
        pago_dep: 0,
        pago_fecha: 0,
      };

      const totalPagadoInscAnterior = pagosInscTotalesMap.get(idequipo) || 0;
      const deudaInscPendiente = Math.max(
        0,
        data.valor_insc - totalPagadoInscAnterior
      );

      const saldoCC = saldosCCMap.get(idequipo) || 0;
      const deudaDepPendiente = saldoCC < 0 ? Math.abs(saldoCC) : 0;

      const deuda_fecha = data.valor_fecha * data.cantidad_partidos;

      const total_pagar = deudaInscPendiente + deudaDepPendiente + deuda_fecha;

      const total_pagado_esta_fecha =
        pagos.pago_ins + pagos.pago_dep + pagos.pago_fecha;
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
        deuda_fecha,
        total_pagar,

        pago_ins: pagos.pago_ins,
        pago_dep: pagos.pago_dep,
        pago_fecha: pagos.pago_fecha,

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

export const updatePagoDeposito = async (
  idfecha: number,
  idequipo: number,
  importe: number
): Promise<void> => {
  try {
    await pool.query(
      `DELETE FROM wfechas_equipos
       WHERE idfecha = $1 AND idequipo = $2 AND tipopago = 2`,
      [idfecha, idequipo]
    );

    if (importe > 0) {
      await pool.query(
        `INSERT INTO wfechas_equipos (idfecha, orden, idequipo, tipopago, importe, fhcarga)
         VALUES ($1, 1, $2, 2, $3, NOW())`,
        [idfecha, idequipo, importe]
      );
    }
  } catch (error) {
    console.error("Error en updatePagoDeposito:", error);
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
