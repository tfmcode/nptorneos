import { pool } from "../config/db";

export interface ISancion {
  id?: number;
  fecha?: string;
  idjugador?: number;
  idequipo?: number;
  idtorneo?: number;
  titulo?: string;
  descripcion?: string;
  codestado?: number;
  fhcarga?: string;
  fhbaja?: string;
  idusuario: number;
  fechafin?: string;
  jugador?: string;
  equipo?: string;
  torneo?: string;
}

export const getSancionById = async (id: number): Promise<ISancion | null> => {
  const { rows } = await pool.query(
    `SELECT s.id, s.fecha, s.idjugador, s.idequipo, s.idtorneo, s.titulo, s.descripcion, 
     s.codestado, s.fhcarga, s.idusuario, s.fechafin,
     j.nombres || ' ' || j.apellido as jugador, e.nombre as equipo, t.nombre as torneo
     FROM sanciones s
     INNER JOIN jugadores j ON s.idjugador = j.id
     INNER JOIN wequipos e ON s.idequipo = e.id
     INNER JOIN wtorneos t ON s.idtorneo = t.id
     WHERE s.id = $1 AND s.fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getSanciones = async ({
  page,
  limit,
  searchTerm,
  startDate,
  endDate,
}: {
  page: number;
  limit: number;
  searchTerm: string;
  startDate: string;
  endDate: string;
}): Promise<{ sanciones: ISancion[]; total: number }> => {
  const offset = (page - 1) * limit;

  let totalQuery: string;
  let sancionesQuery: string;
  let params: any[];

  let totQuery = `
    SELECT COUNT(*) FROM sanciones s
    INNER JOIN jugadores j ON s.idjugador = j.id
    INNER JOIN wequipos e ON s.idequipo = e.id
    INNER JOIN wtorneos t ON s.idtorneo = t.id
  `;

  let query = `
    SELECT s.id, s.fecha, s.idjugador, s.idequipo, s.idtorneo, s.titulo, s.descripcion, 
           s.codestado, s.fhcarga, s.idusuario, s.fechafin, s.fhbaja,
           j.nombres || ' ' || j.apellido as jugador, e.nombre as equipo, t.nombre as torneo
    FROM sanciones s
    INNER JOIN jugadores j ON s.idjugador = j.id
    INNER JOIN wequipos e ON s.idequipo = e.id
    INNER JOIN wtorneos t ON s.idtorneo = t.id
  `;

  if (searchTerm) {
    totalQuery = `${totQuery} WHERE s.fhbaja IS NULL AND (LOWER(s.titulo) LIKE LOWER($1) OR LOWER(s.descripcion) LIKE LOWER($1)) AND s.fecha BETWEEN $2 AND $3;`;
    sancionesQuery = `
      ${query}
      WHERE s.fhbaja IS NULL AND (LOWER(s.titulo) LIKE LOWER($1) OR LOWER(s.descripcion) LIKE LOWER($1)) AND s.fecha BETWEEN $2 AND $3
      ORDER BY s.fecha DESC 
      LIMIT $4 OFFSET $5;`;
    params = [`%${searchTerm}%`, startDate, endDate, limit, offset];
  } else {
    totalQuery = `${totQuery} WHERE s.fhbaja IS NULL AND s.fecha BETWEEN $1 AND $2;`;
    sancionesQuery = `
      ${query}
      WHERE s.fhbaja IS NULL AND s.fecha BETWEEN $1 AND $2
      ORDER BY s.fecha DESC 
      LIMIT $3 OFFSET $4;`;
    params = [startDate, endDate, limit, offset];
  }

  const totalResult = await pool.query(
    totalQuery,
    searchTerm ? [`%${searchTerm}%`, startDate, endDate] : [startDate, endDate]
  );
  const { rows } = await pool.query(sancionesQuery, params);

  return {
    sanciones: rows,
    total: parseInt(totalResult.rows[0].count, 10),
  };
};

export const createSancion = async (sancion: ISancion): Promise<ISancion> => {
  const { rows } = await pool.query(
    `INSERT INTO sanciones (
      fecha, idjugador, idequipo, idtorneo, titulo, descripcion,
      codestado, fhcarga, idusuario, fechafin
    ) 
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9
    ) 
    RETURNING *;`,
    [
      sancion.fecha,
      sancion.idjugador,
      sancion.idequipo,
      sancion.idtorneo,
      sancion.titulo,
      sancion.descripcion,
      sancion.codestado,
      sancion.idusuario,
      sancion.fechafin,
    ]
  );
  return rows[0];
};

export const updateSancion = async (
  id: number,
  sancion: Partial<ISancion>
): Promise<ISancion | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  // Exclude computed fields that are not actual database columns
  const excludedFields = ["jugador", "equipo", "torneo"];

  for (const key in sancion) {
    if (
      sancion[key as keyof ISancion] !== undefined &&
      !excludedFields.includes(key)
    ) {
      updates.push(`${key} = $${index}`);
      values.push(sancion[key as keyof ISancion]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(id);
  const query = `UPDATE sanciones SET ${updates.join(
    ", "
  )} WHERE id = $${index} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deleteSancion = async (id: number): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE sanciones SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;",
      [id]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error al eliminar sanción:", error);
    throw new Error("Error al eliminar la sanción.");
  }
};
