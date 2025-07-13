import { pool } from "../config/db";

export interface IInscripcion {
  id?: number;
  email?: string;
  equipo?: string;
  idtorneo?: number;
  codestado?: number;
  fhcarga?: Date;
  fhbaja?: Date | null;
  idzona?: number;
  idequipoasoc?: number;
  foto?: string;
  torneo?: string;
}

export const getAllInscripciones = async (
  page: number,
  limit: number,
  searchTerm: string
): Promise<{ inscripciones: IInscripcion[]; total: number }> => {
  const offset = (page - 1) * limit;

  let totalQuery: string;
  let inscripcionesQuery: string;
  let params: any[];

  if (searchTerm) {
    totalQuery = `SELECT COUNT(*) FROM inscripciones i
      LEFT JOIN wtorneos t ON i.idtorneo = t.id
      WHERE i.fhbaja IS NULL AND (LOWER(i.equipo) LIKE LOWER($1) OR LOWER(t.nombre) LIKE LOWER($1));`;
    inscripcionesQuery = `
      SELECT i.*, t.nombre as torneo FROM inscripciones i
      LEFT JOIN wtorneos t ON i.idtorneo = t.id
      WHERE i.fhbaja IS NULL AND (LOWER(i.equipo) LIKE LOWER($1) OR LOWER(t.nombre) LIKE LOWER($1))
      ORDER BY i.id DESC 
      LIMIT $2 OFFSET $3;`;
    params = [`%${searchTerm}%`, limit, offset];
  } else {
    totalQuery = `SELECT COUNT(*) FROM inscripciones i WHERE i.fhbaja IS NULL;`;
    inscripcionesQuery = `
      SELECT i.*, t.nombre as torneo FROM inscripciones i
      LEFT JOIN wtorneos t ON i.idtorneo = t.id
      WHERE i.fhbaja IS NULL
      ORDER BY i.id DESC 
      LIMIT $1 OFFSET $2;`;
    params = [limit, offset];
  }

  const totalResult = await pool.query(
    totalQuery,
    searchTerm ? [`%${searchTerm}%`] : []
  );
  const { rows } = await pool.query(inscripcionesQuery, params);

  return {
    inscripciones: rows,
    total: parseInt(totalResult.rows[0].count, 10),
  };
};

export const getInscripcionById = async (
  id: number
): Promise<IInscripcion | null> => {
  const { rows } = await pool.query(
    `SELECT i.*, t.nombre as torneo FROM inscripciones i
    LEFT JOIN wtorneos t ON i.idtorneo = t.id
    WHERE i.id = $1 AND i.fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const createInscripcion = async (
  inscripcion: IInscripcion
): Promise<IInscripcion> => {
  const { rows } = await pool.query(
    `INSERT INTO inscripciones (email, equipo, idtorneo, codestado, idzona, idequipoasoc, foto) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *;`,
    [
      inscripcion.email,
      inscripcion.equipo,
      inscripcion.idtorneo,
      inscripcion.codestado,
      inscripcion.idzona,
      inscripcion.idequipoasoc,
      inscripcion.foto,
    ]
  );
  return rows[0];
};

export const updateEquipoAsoc = async (
  id: number,
  idequipoasoc: number
): Promise<IInscripcion | null> => {
  const { rows } = await pool.query(
    `UPDATE inscripciones SET idequipoasoc = $1 WHERE id = $2 RETURNING *;`,
    [idequipoasoc, id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const updateInscripcion = async (
  id: number,
  inscripcion: Partial<IInscripcion>
): Promise<IInscripcion | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  // Exclude computed fields that are not actual database columns
  const excludedFields = ["torneo"];

  for (const key in inscripcion) {
    if (
      inscripcion[key as keyof IInscripcion] !== undefined &&
      !excludedFields.includes(key)
    ) {
      updates.push(`${key} = $${index}`);
      values.push(inscripcion[key as keyof IInscripcion]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(id);
  const query = `UPDATE inscripciones SET ${updates.join(
    ", "
  )} WHERE id = $${index} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deleteInscripcion = async (id: number): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE inscripciones SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;",
      [id]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error al eliminar inscripción:", error);
    throw new Error("Error al eliminar la inscripción.");
  }
};
