import { pool } from "../config/db";

export interface IMovimientoCuentaCorriente {
  txfecha: string;
  descripcion: string;
  debe: number;
  haber: number;
}

export interface ICuentaCorrienteEquipo {
  idequipo: number;
  nombre_equipo: string;
  movimientos: IMovimientoCuentaCorriente[];
  saldo_final: number;
}

export interface IResumenCuentaCorriente {
  idequipo: number;
  nombre_equipo: string;
  saldo_actual: number;
  ultimo_movimiento: string | null;
  total_debe: number;
  total_haber: number;
}

export const getCuentaCorrienteEquipo = async (
  idequipo: number
): Promise<ICuentaCorrienteEquipo> => {
  const { rows: equipoRows } = await pool.query(
    `SELECT nombre FROM wequipos WHERE id = $1 AND fhbaja IS NULL`,
    [idequipo]
  );

  if (equipoRows.length === 0) {
    throw new Error("Equipo no encontrado");
  }

  const nombreEquipo = equipoRows[0].nombre;

  const { rows: movimientosRaw } = await pool.query(
    `SELECT * FROM winfo_ccequipos($1)`,
    [idequipo]
  );

  const movimientos: IMovimientoCuentaCorriente[] = movimientosRaw.map(
    (mov) => ({
      txfecha: mov.txfecha,
      descripcion: mov.descripcion,
      debe: Number(mov.debe) || 0,
      haber: Number(mov.haber) || 0,
    })
  );

  let saldoFinal = 0;
  movimientos.forEach((mov) => {
    saldoFinal -= mov.debe;
    saldoFinal += mov.haber;
  });

  return {
    idequipo,
    nombre_equipo: nombreEquipo,
    movimientos,
    saldo_final: saldoFinal,
  };
};

export const getCuentasCorrientesGeneral = async (): Promise<
  IResumenCuentaCorriente[]
> => {
  const query = `
    WITH movimientos_equipos AS (
      -- 1️⃣ Deudas de inscripción (torneos)
      SELECT 
        e.id as idequipo,
        e.nombre as nombre_equipo,
        SUM(tei.inscrip) as total_debe,
        0 as total_haber,
        MAX(tei.fhcarga) as ultimo_movimiento
      FROM wtorneos_equipos_insc tei
      INNER JOIN wtorneos t ON tei.idtorneo = t.id
      INNER JOIN wequipos e ON tei.idequipo = e.id
      WHERE t.fhbaja IS NULL 
        AND e.fhbaja IS NULL
        AND tei.inscrip > 0
      GROUP BY e.id, e.nombre

      UNION ALL

      -- 2️⃣ Deudas de fechas (habilitaciones) - SIN join a wtorneos_fechas
      SELECT 
        e.id as idequipo,
        e.nombre as nombre_equipo,
        SUM(feh.importe) as total_debe,
        0 as total_haber,
        MAX(feh.fhcarga) as ultimo_movimiento
      FROM wfechas_equipos_hab feh
      INNER JOIN wtorneos t ON feh.idtorneo = t.id
      INNER JOIN wequipos e ON feh.idequipo = e.id
      WHERE t.fhbaja IS NULL
        AND e.fhbaja IS NULL
        AND feh.importe > 0
      GROUP BY e.id, e.nombre

      UNION ALL

      -- 3️⃣ Deudas de depósito
      SELECT 
        e.id as idequipo,
        e.nombre as nombre_equipo,
        SUM(d.importe) as total_debe,
        0 as total_haber,
        MAX(d.fecha) as ultimo_movimiento
      FROM wdepositos d
      INNER JOIN wequipos e ON d.idequipo = e.id
      WHERE d.fhbaja IS NULL
        AND d.codtipo = 2
        AND d.importe > 0
        AND e.fhbaja IS NULL
      GROUP BY e.id, e.nombre

      UNION ALL

      -- 4️⃣ Pagos de inscripción
      SELECT 
        e.id as idequipo,
        e.nombre as nombre_equipo,
        0 as total_debe,
        SUM(fe.importe) as total_haber,
        MAX(wtf.fecha) as ultimo_movimiento
      FROM wfechas_equipos fe
      INNER JOIN wtorneos_fechas wtf ON fe.idfecha = wtf.id
      INNER JOIN wequipos e ON fe.idequipo = e.id
      WHERE wtf.fhbaja IS NULL
        AND fe.tipopago = 1
        AND e.fhbaja IS NULL
        AND fe.importe > 0
      GROUP BY e.id, e.nombre

      UNION ALL

      -- 5️⃣ Pagos de depósito
      SELECT 
        e.id as idequipo,
        e.nombre as nombre_equipo,
        0 as total_debe,
        SUM(d.importe) as total_haber,
        MAX(d.fecha) as ultimo_movimiento
      FROM wdepositos d
      INNER JOIN wequipos e ON d.idequipo = e.id
      WHERE d.fhbaja IS NULL
        AND d.codtipo = 1
        AND d.importe > 0
        AND e.fhbaja IS NULL
      GROUP BY e.id, e.nombre

      UNION ALL

      -- 6️⃣ Pagos de fechas
      SELECT
        e.id as idequipo,
        e.nombre as nombre_equipo,
        0 as total_debe,
        SUM(fe.importe) as total_haber,
        MAX(wtf.fecha) as ultimo_movimiento
      FROM wfechas_equipos fe
      INNER JOIN wtorneos_fechas wtf ON fe.idfecha = wtf.id
      INNER JOIN wequipos e ON fe.idequipo = e.id
      WHERE wtf.fhbaja IS NULL
        AND fe.tipopago = 3
        AND e.fhbaja IS NULL
        AND fe.importe > 0
      GROUP BY e.id, e.nombre

      UNION ALL

      -- 7️⃣ Descuentos (tipopago = 4)
      SELECT
        e.id as idequipo,
        e.nombre as nombre_equipo,
        0 as total_debe,
        SUM(fe.importe) as total_haber,
        MAX(wtf.fecha) as ultimo_movimiento
      FROM wfechas_equipos fe
      INNER JOIN wtorneos_fechas wtf ON fe.idfecha = wtf.id
      INNER JOIN wequipos e ON fe.idequipo = e.id
      WHERE wtf.fhbaja IS NULL
        AND fe.tipopago = 4
        AND e.fhbaja IS NULL
        AND fe.importe > 0
      GROUP BY e.id, e.nombre
    )
    SELECT
      idequipo,
      nombre_equipo,
      SUM(total_debe) as total_debe,
      SUM(total_haber) as total_haber,
      (SUM(total_haber) - SUM(total_debe)) as saldo_actual,
      MAX(ultimo_movimiento) as ultimo_movimiento
    FROM movimientos_equipos
    GROUP BY idequipo, nombre_equipo
    ORDER BY nombre_equipo ASC
  `;

  const { rows } = await pool.query(query);

  return rows.map((row) => ({
    idequipo: row.idequipo,
    nombre_equipo: row.nombre_equipo,
    saldo_actual: parseFloat(row.saldo_actual || 0),
    ultimo_movimiento: row.ultimo_movimiento || null,
    total_debe: parseFloat(row.total_debe || 0),
    total_haber: parseFloat(row.total_haber || 0),
  }));
};
