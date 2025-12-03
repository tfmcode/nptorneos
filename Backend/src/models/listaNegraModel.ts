import { pool } from "../config/db";

export interface IListaNegra {
  id?: number;
  idjugador: number;
  fecha?: Date | string | null;
  observ?: string;
  fhbaja?: Date | string | null;
  fhultmod?: Date | string | null;
  usrultmod?: number;
  codestado?: number; // 1: habilitado, 0: inhabilitado
  fhcarga?: Date | string | null;
}

export const getAllListaNegra = async (
  page: number,
  limit: number,
  searchTerm: string
): Promise<{ registros: IListaNegra[]; total: number }> => {
  const offset = (page - 1) * limit;
  const params: any[] = [];

  let baseQuery = `
    SELECT ln.*, j.nombres, j.apellido, j.docnro
    FROM listanegra ln
    INNER JOIN jugadores j ON j.id = ln.idjugador
    WHERE ln.fhbaja IS NULL`;

  if (searchTerm) {
    const normalizedSearch = searchTerm.trim().replace(/\s+/g, " ");
    const likeParam = `%${normalizedSearch.toLowerCase()}%`;

    baseQuery += ` AND (
      LOWER(j.nombres) LIKE LOWER($1)
      OR LOWER(j.apellido) LIKE LOWER($1)
      OR LOWER(CONCAT(j.apellido, ' ', j.nombres)) LIKE LOWER($1)
      OR LOWER(CONCAT(j.nombres, ' ', j.apellido)) LIKE LOWER($1)
      OR CAST(j.docnro AS TEXT) LIKE $1
    )`;
    params.push(likeParam);
  }

  const totalQuery = `SELECT COUNT(*) FROM (${baseQuery}) AS countsub;`;
  const paginatedQuery = `${baseQuery} ORDER BY ln.fhcarga DESC LIMIT $${
    params.length + 1
  } OFFSET $${params.length + 2}`;

  const totalResult = await pool.query(totalQuery, params);
  const { rows } = await pool.query(paginatedQuery, [...params, limit, offset]);

  return {
    registros: rows,
    total: parseInt(totalResult.rows[0].count, 10),
  };
};

export const getListaNegraById = async (
  id: number
): Promise<IListaNegra | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM listanegra WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const createListaNegra = async (
  data: IListaNegra
): Promise<IListaNegra> => {
  const { idjugador, fecha, observ, usrultmod, codestado = 0 } = data;

  const { rows } = await pool.query(
    `INSERT INTO listanegra (idjugador, fecha, observ, usrultmod, codestado, fhcarga)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING *;`,
    [idjugador, fecha, observ, usrultmod, codestado]
  );

  await pool.query(`UPDATE jugadores SET codestado = $1 WHERE id = $2;`, [
    codestado,
    idjugador,
  ]);

  return rows[0];
};

export const updateListaNegra = async (
  id: number,
  data: Partial<IListaNegra>
): Promise<IListaNegra | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;
  let actualizarCodestado = false;
  let nuevoCodestado: number | undefined;

  const camposValidos = ["fecha", "observ", "codestado", "usrultmod"];

  for (const key of camposValidos) {
    const value = data[key as keyof IListaNegra];
    if (value !== undefined) {
      if (key === "codestado") {
        actualizarCodestado = true;
        nuevoCodestado = value as number;
      }
      updates.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos válidos para actualizar.");
  }

  updates.push(`fhultmod = NOW()`);
  values.push(id);

  const query = `UPDATE listanegra SET ${updates.join(
    ", "
  )} WHERE id = $${index} RETURNING *;`;
  const { rows } = await pool.query(query, values);

  // Si se actualizó codestado, también actualizá el jugador
  if (actualizarCodestado && nuevoCodestado !== undefined && rows.length > 0) {
    const jugadorId = rows[0].idjugador;
    await pool.query(`UPDATE jugadores SET codestado = $1 WHERE id = $2;`, [
      nuevoCodestado,
      jugadorId,
    ]);
  }

  return rows.length > 0 ? rows[0] : null;
};

export const deleteListaNegra = async (id: number): Promise<boolean> => {
  const result = await pool.query(
    `UPDATE listanegra SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
};
