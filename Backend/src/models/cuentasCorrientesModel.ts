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
      -- Deudas de inscripción (torneos)
      SELECT 
        e.id as idequipo,
        e.nombre as nombre_equipo,
        SUM(a.inscrip) as total_debe,
        0 as total_haber,
        MAX(t.fhcarga) as ultimo_movimiento
      FROM wtorneos_equipos_insc a
      INNER JOIN wtorneos t ON a.idtorneo = t.id
      INNER JOIN wequipos e ON a.idequipo = e.id
      WHERE t.fhbaja IS NULL 
        AND e.fhbaja IS NULL
        AND a.inscrip > 0
      GROUP BY e.id, e.nombre

      UNION ALL

      -- Deudas de depósito
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

      -- Deudas de fechas (habilitaciones)
      SELECT 
        e.id as idequipo,
        e.nombre as nombre_equipo,
        SUM(a.importe) as total_debe,
        0 as total_haber,
        MAX(tf.fecha) as ultimo_movimiento
      FROM wfechas_equipos_hab a
      INNER JOIN wtorneos_fechas tf ON a.idfecha = tf.id
      INNER JOIN wequipos e ON a.idequipo = e.id
      INNER JOIN wtorneos t ON a.idtorneo = t.id
      WHERE tf.fhbaja IS NULL
        AND e.fhbaja IS NULL
        AND t.fhbaja IS NULL
        AND a.importe > 0
      GROUP BY e.id, e.nombre

      UNION ALL

      -- Pagos de inscripción
      SELECT 
        e.id as idequipo,
        e.nombre as nombre_equipo,
        0 as total_debe,
        SUM(a.importe) as total_haber,
        MAX(tf.fecha) as ultimo_movimiento
      FROM wfechas_equipos a
      INNER JOIN wtorneos_fechas tf ON a.idfecha = tf.id
      INNER JOIN wequipos e ON a.idequipo = e.id
      WHERE tf.fhbaja IS NULL
        AND a.tipopago = 1
        AND e.fhbaja IS NULL
        AND a.importe > 0
      GROUP BY e.id, e.nombre

      UNION ALL

      -- Pagos de depósito
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

      -- Pagos de fechas
      SELECT 
        e.id as idequipo,
        e.nombre as nombre_equipo,
        0 as total_debe,
        SUM(a.importe) as total_haber,
        MAX(tf.fecha) as ultimo_movimiento
      FROM wfechas_equipos a
      INNER JOIN wtorneos_fechas tf ON a.idfecha = tf.id
      INNER JOIN wequipos e ON a.idequipo = e.id
      WHERE tf.fhbaja IS NULL
        AND a.tipopago = 3
        AND e.fhbaja IS NULL
        AND a.importe > 0
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
    HAVING (SUM(total_haber) - SUM(total_debe)) != 0
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
