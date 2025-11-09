import { pool } from "../config/db";

export interface IJugador {
  id?: number;
  nombres: string;
  apellido: string;
  fhnacimiento?: string | Date | null;
  docnro: string;
  telefono?: string;
  email?: string;
  facebook?: string;
  twitter?: string;
  peso?: string;
  altura?: string;
  apodo?: string;
  posicion?: string;
  categoria?: string;
  piernahabil?: string;
  codestado?: number;
  fhcarga?: Date;
  fhbaja?: Date | null;
  fhultmod?: Date;
  usrultmod?: number;
  foto?: string;
}

export const getJugadorById = async (id: number): Promise<IJugador | null> => {
  const { rows } = await pool.query(
    `SELECT id, nombres, apellido, 
        TO_CHAR(fhnacimiento, 'YYYY-MM-DD') as fhnacimiento, 
        docnro, telefono, email, facebook, twitter, 
        peso, altura, apodo, posicion, categoria, 
        piernahabil, codestado, fhcarga, fhbaja, fhultmod, usrultmod, foto
     FROM jugadores WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getAllJugadores = async (
  page: number,
  limit: number,
  searchTerm: string
): Promise<{ jugadores: IJugador[]; total: number }> => {
  const offset = (page - 1) * limit;

  let totalQuery: string;
  let jugadoresQuery: string;
  let params: any[];

  if (searchTerm) {
    totalQuery = `
      SELECT COUNT(*) 
      FROM jugadores 
      WHERE fhbaja IS NULL 
      AND (
        LOWER(nombres) LIKE LOWER($1) 
        OR LOWER(apellido) LIKE LOWER($1)
        OR CAST(docnro AS TEXT) LIKE $1
      );`;

    jugadoresQuery = `
      SELECT id, nombres, apellido, 
          TO_CHAR(fhnacimiento, 'YYYY-MM-DD') as fhnacimiento, 
          docnro, telefono, email, facebook, twitter, 
          peso, altura, apodo, posicion, categoria, 
          piernahabil, codestado, fhcarga, fhbaja, fhultmod, usrultmod, foto
      FROM jugadores 
      WHERE fhbaja IS NULL 
      AND (
        LOWER(nombres) LIKE LOWER($1) 
        OR LOWER(apellido) LIKE LOWER($1)
        OR CAST(docnro AS TEXT) LIKE $1
      )
      ORDER BY fhcarga DESC 
      LIMIT $2 OFFSET $3;`;

    params = [`%${searchTerm}%`, limit, offset];
  } else {
    totalQuery = `SELECT COUNT(*) FROM jugadores WHERE fhbaja IS NULL;`;
    jugadoresQuery = `
      SELECT id, nombres, apellido, 
          TO_CHAR(fhnacimiento, 'YYYY-MM-DD') as fhnacimiento, 
          docnro, telefono, email, facebook, twitter, 
          peso, altura, apodo, posicion, categoria, 
          piernahabil, codestado, fhcarga, fhbaja, fhultmod, usrultmod, foto
      FROM jugadores 
      WHERE fhbaja IS NULL
      ORDER BY fhcarga DESC 
      LIMIT $1 OFFSET $2;`;
    params = [limit, offset];
  }

  const totalResult = await pool.query(
    totalQuery,
    searchTerm ? [`%${searchTerm}%`] : []
  );
  const { rows } = await pool.query(jugadoresQuery, params);

  return {
    jugadores: rows,
    total: parseInt(totalResult.rows[0].count, 10),
  };
};

export const createJugador = async (jugador: IJugador): Promise<IJugador> => {
  let fechaNacimiento: string | null = null;

  if (jugador.fhnacimiento) {
    const parsedDate = new Date(jugador.fhnacimiento);
    fechaNacimiento = !isNaN(parsedDate.getTime())
      ? parsedDate.toISOString().split("T")[0]
      : null;
  }

  const { rows } = await pool.query(
    `INSERT INTO jugadores 
     (nombres, apellido, fhnacimiento, docnro, telefono, email, facebook, twitter, peso, altura, apodo, posicion, categoria, piernahabil, codestado, foto, fhcarga) 
     VALUES 
     ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()) 
     RETURNING *;`,
    [
      jugador.nombres,
      jugador.apellido,
      fechaNacimiento,
      jugador.docnro,
      jugador.telefono,
      jugador.email,
      jugador.facebook,
      jugador.twitter,
      jugador.peso,
      jugador.altura,
      jugador.apodo,
      jugador.posicion,
      jugador.categoria,
      jugador.piernahabil,
      jugador.codestado,
      jugador.foto,
    ]
  );

  return rows[0];
};

export const updateJugador = async (
  id: number,
  jugador: Partial<IJugador>
): Promise<IJugador | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in jugador) {
    if (
      jugador[key as keyof IJugador] !== undefined &&
      key !== "fhultmod" &&
      key !== "foto"
    ) {
      let value = jugador[key as keyof IJugador];

      if (key === "fhnacimiento" && value) {
        const parsedDate = new Date(value);
        value = !isNaN(parsedDate.getTime())
          ? parsedDate.toISOString().split("T")[0]
          : null;
      }

      updates.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  updates.push(`fhultmod = NOW()`);
  values.push(id);

  const query = `UPDATE jugadores SET ${updates.join(", ")} 
                 WHERE id = $${index} AND fhbaja IS NULL RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deleteJugador = async (id: number): Promise<boolean> => {
  const result = await pool.query(
    "UPDATE jugadores SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;",
    [id]
  );
  return (result.rowCount ?? 0) > 0;
};
