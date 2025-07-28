import { pool } from "../config/db";

export interface IFecha {
  id?: number;
  fecha: string; // YYYY-MM-DD
  idsede: number;
  idsubsede: number;
  idtorneo: number;
  codfecha: number;
  idturno: number;
  idprofesor?: number;
  observ?: string;
  fhcierre?: string | null;
  fhcierrecaja?: string | null;
  fhbaja?: string | null;
  fhcarga?: string | null;
  fhultmod?: string | null;
}

export interface IFechaResumen {
  id: number;
  txfecha: string;
  sede: string;
  subsede: string;
  torneo: string;
  ftorneo: string;
  turno: string;
  cierre: "S" | "N";
  cierrecaja: "S" | "N";
  txfhcierrecaja: string;
}

export const getFechasByFiltro = async (
  desde?: string,
  hasta?: string,
  idtorneo?: number
): Promise<IFechaResumen[]> => {
  let where = `WHERE f.fhbaja IS NULL`;
  const params: any[] = [];
  let i = 1;

  if (desde && hasta) {
    where += ` AND f.fecha BETWEEN $${i++} AND $${i++}`;
    params.push(desde, hasta);
  }

  if (idtorneo) {
    where += ` AND f.idtorneo = $${i++}`;
    params.push(idtorneo);
  }

  const query = `
    SELECT  
      f.id,
      TO_CHAR(f.fecha, 'DD-MM-YYYY') AS txfecha,
      s.nombre AS sede,
      ss.nombre AS subsede,
      t.nombre AS torneo,
      c.descripcion AS ftorneo,
      c1.descripcion AS turno,
      CASE WHEN f.fhcierre IS NULL THEN 'N' ELSE 'S' END AS cierre,
      CASE WHEN f.fhcierrecaja IS NULL THEN 'N' ELSE 'S' END AS cierrecaja,
      TO_CHAR(f.fhcierrecaja, 'DD-MM-YYYY HH24:MI') AS txfhcierrecaja
    FROM wtorneos_fechas f
    JOIN wsedes s ON s.id = f.idsede
    JOIN wsedes ss ON ss.id = f.idsubsede
    JOIN wtorneos t ON t.id = f.idtorneo
    JOIN codificadores c ON c.idcodificador = 6 AND c.id = f.codfecha
    JOIN codificadores c1 ON c1.idcodificador = 7 AND c1.id = f.idturno
    ${where}
    ORDER BY f.fecha DESC;
  `;

  const { rows } = await pool.query(query, params);
  return rows;
};

// Obtener fecha por ID
export const getFechaById = async (id: number): Promise<IFecha | null> => {
  const query = `
    SELECT 
      f.* 
    FROM wtorneos_fechas f
    WHERE f.id = $1 AND f.fhbaja IS NULL;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows.length ? rows[0] : null;
};

export const createFecha = async (data: IFecha): Promise<IFecha> => {
  const {
    fecha,
    idsede,
    idsubsede,
    idtorneo,
    codfecha,
    idturno,
    idprofesor,
    observ,
  } = data;

  const query = `
    INSERT INTO wtorneos_fechas (
      fecha, idsede, idsubsede, idtorneo, codfecha, idturno, idprofesor, observ, fhcarga
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, NOW()
    )
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [
    fecha,
    idsede,
    idsubsede,
    idtorneo,
    codfecha,
    idturno,
    idprofesor || null,
    observ || null,
  ]);

  return rows[0];
};

export const updateFecha = async (
  id: number,
  data: Partial<IFecha>
): Promise<IFecha | null> => {
  const campos: string[] = [];
  const values: any[] = [];
  let i = 1;

  for (const [key, value] of Object.entries(data)) {
    campos.push(`${key} = $${i}`);
    values.push(value);
    i++;
  }

  campos.push(`fhultmod = NOW()`);
  values.push(id);

  const query = `
    UPDATE wtorneos_fechas
    SET ${campos.join(", ")}
    WHERE id = $${i}
    RETURNING *;
  `;

  const { rows } = await pool.query(query, values);
  return rows.length ? rows[0] : null;
};

export const deleteFecha = async (id: number): Promise<boolean> => {
  const query = `
    UPDATE wtorneos_fechas SET fhbaja = NOW()
    WHERE id = $1 AND fhbaja IS NULL;
  `;
  const res = await pool.query(query, [id]);
  return (res.rowCount ?? 0) > 0;
};
