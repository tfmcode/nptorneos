import { pool } from "../config/db";

export interface IInscripcionJugador {
  id?: number;
  idinscrip?: number;
  orden?: number;
  apellido?: string;
  nombres?: string;
  docnro?: number;
  fhnacimiento?: Date | string;
  telefono?: string;
  email?: string;
  posicion?: string;
  facebook?: string;
  fhcarga?: Date;
  fhbaja?: Date | null;
  capitan?: number;
  subcapitan?: number;
  jugadorexistente?: boolean;
  sancion?: boolean;
  listanegra?: boolean;
}

export const getAllInscripcionesJugadores = async (): Promise<
  IInscripcionJugador[]
> => {
  const { rows } = await pool.query(
    `SELECT * FROM inscripciones_jug WHERE fhbaja IS NULL ORDER BY id DESC;`
  );
  return rows;
};

export const getInscripcionesJugadoresByInscripcion = async (
  idinscrip: number
): Promise<IInscripcionJugador[]> => {
  const { rows } = await pool.query(
    `SELECT ij.*,
    CASE WHEN j.id IS NOT NULL THEN TRUE ELSE FALSE END AS jugadorexistente,
    CASE WHEN s.id IS NOT NULL AND s.fechafin > NOW() THEN TRUE ELSE FALSE END AS sancion,
    CASE WHEN ln.id IS NOT NULL THEN TRUE ELSE FALSE END AS listanegra
    FROM inscripciones_jug ij
    LEFT JOIN jugadores j ON ij.docnro = j.docnro AND j.fhbaja IS NULL
    LEFT JOIN sanciones s ON j.id = s.idjugador AND s.fhbaja IS NULL
    LEFT JOIN listanegra ln ON j.id = ln.idjugador AND ln.fhbaja IS NULL
    WHERE ij.idinscrip = $1 AND ij.fhbaja IS NULL
    ORDER BY ij.apellido, ij.nombres ASC;`,
    [idinscrip]
  );
  return rows;
};

export const getInscripcionJugadorById = async (
  id: number
): Promise<IInscripcionJugador | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM inscripciones_jug WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const createInscripcionJugador = async (
  inscripcionJugador: IInscripcionJugador
): Promise<IInscripcionJugador> => {
  const { rows } = await pool.query(
    `INSERT INTO inscripciones_jug (
      idinscrip, orden, apellido, nombres, docnro, fhnacimiento, telefono, 
      email, posicion, facebook, capitan, subcapitan
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
    RETURNING *;`,
    [
      inscripcionJugador.idinscrip,
      inscripcionJugador.orden,
      inscripcionJugador.apellido,
      inscripcionJugador.nombres,
      inscripcionJugador.docnro,
      inscripcionJugador.fhnacimiento,
      inscripcionJugador.telefono,
      inscripcionJugador.email,
      inscripcionJugador.posicion,
      inscripcionJugador.facebook,
      inscripcionJugador.capitan || 0,
      inscripcionJugador.subcapitan || 0,
    ]
  );
  return rows[0];
};

export const updateInscripcionJugador = async (
  id: number,
  inscripcionJugador: Partial<IInscripcionJugador>
): Promise<IInscripcionJugador | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  const excludeFields = ["jugadorexistente", "sancion", "listanegra"];

  for (const key in inscripcionJugador) {
    if (
      inscripcionJugador[key as keyof IInscripcionJugador] !== undefined &&
      !excludeFields.includes(key)
    ) {
      updates.push(`${key} = $${index}`);
      values.push(inscripcionJugador[key as keyof IInscripcionJugador]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(id);
  const query = `UPDATE inscripciones_jug SET ${updates.join(
    ", "
  )} WHERE id = $${index} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deleteInscripcionJugador = async (
  id: number
): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE inscripciones_jug SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;",
      [id]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error al eliminar jugador de inscripción:", error);
    throw new Error("Error al eliminar el jugador de la inscripción.");
  }
};
