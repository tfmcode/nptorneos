import { pool } from "../config/db";

export interface IPartido {
  id?: number;
  codtipo: number;
  idequipo1: number;
  nombre1?: string;
  idequipo2: number;
  nombre2?: string;
  idzona: number;
  goles1?: number;
  goles2?: number;
  codestado: number;
  fecha?: string;
  nrofecha?: number;
  observaciones?: string;
  estadio?: string;
  incidencias?: string;
  arbitro?: string;
  puntobonus1?: number;
  puntobonus2?: number;
  formacion1?: string;
  formacion2?: string;
  cambios1?: string;
  cambios2?: string;
  dt1?: string;
  dt2?: string;
  suplentes1?: string;
  suplentes2?: string;
  idsede?: number;
  sede?: string;
  fhcarga?: string;
  fhbaja?: string;
  idusuario?: number;
  idprofesor?: number;
  ausente1?: string;
  ausente2?: string;
  idfecha?: number;
}

export const getPartidoById = async (id: number): Promise<IPartido | null> => {
  const { rows } = await pool.query(
    `SELECT p.*, e1.nombre as nombre1, e2.nombre as nombre2, s.nombre as sede FROM partidos p
    LEFT JOIN wequipos e1 ON p.idequipo1 = e1.id
    LEFT JOIN wequipos e2 ON p.idequipo2 = e2.id
    LEFT JOIN wsedes s ON p.idsede = s.id
    WHERE p.id = $1 AND p.fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getPartidosByZona = async (
  idzona: number
): Promise<IPartido[]> => {
  const { rows } = await pool.query(
    `SELECT p.*, e1.nombre as nombre1, e2.nombre as nombre2, s.nombre as sede FROM partidos p
    LEFT JOIN wequipos e1 ON p.idequipo1 = e1.id
    LEFT JOIN wequipos e2 ON p.idequipo2 = e2.id
    LEFT JOIN wsedes s ON p.idsede = s.id
    WHERE p.idzona = $1 AND p.fhbaja IS NULL ORDER BY id ASC;`,
    [idzona]
  );
  return rows;
};

export const createPartido = async (partido: IPartido): Promise<IPartido> => {
  const columns = [
    "codtipo",
    "idequipo1",
    "idequipo2",
    "idzona",
    "codestado",
    "fecha",
    "nrofecha",
    "observaciones",
    "estadio",
    "incidencias",
    "arbitro",
    "puntobonus1",
    "puntobonus2",
    "formacion1",
    "formacion2",
    "cambios1",
    "cambios2",
    "dt1",
    "dt2",
    "suplentes1",
    "suplentes2",
    "idsede",
    "idusuario",
    "idprofesor",
    "ausente1",
    "ausente2",
    "idfecha",
    "goles1",
    "goles2",
  ];
  const values = columns.map((col) => partido[col as keyof IPartido]);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

  const { rows } = await pool.query(
    `INSERT INTO partidos (
      ${columns.join(", ")}, fhcarga
    ) VALUES (
      ${placeholders}, NOW()
    ) RETURNING *;`,
    values
  );
  return rows[0];
};

export const updatePartido = async (
  id: number,
  partido: Partial<IPartido>
): Promise<IPartido | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in partido) {
    if (partido[key as keyof IPartido] !== undefined) {
      updates.push(`${key} = $${index}`);
      values.push(partido[key as keyof IPartido]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(id);
  const query = `UPDATE partidos SET ${updates.join(
    ", "
  )} WHERE id = $${index} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deletePartido = async (id: number): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE partidos SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;",
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error al eliminar partido:", error);
    throw new Error("Error al eliminar el partido.");
  }
};
