import { pool } from "../config/db";

export interface IEquipo {
  id?: number;
  nombre: string;
  abrev?: string;
  contacto?: string;
  emailcto?: string;
  telefonocto?: string;
  celularcto?: string;
  contrasenia?: string;
  buenafe?: number;
  codcateg?: number;
  coddeporte: number;
  iniciales?: string;
  codestado?: number;
  archivoubic?: string;
  archivosize?: number;
  archivonom?: string;
  idsede?: number;
  sede_nombre?: string;
  fhcarga?: Date;
  fhbaja?: Date | null;
  idusuario?: number;
  foto?: string;
  observ?: string;
  saldodeposito?: number;
  fhultmod?: Date;
}

// Obtener todos los equipos con paginación y búsqueda
export const getAllEquipos = async (
  page: number,
  limit: number,
  searchTerm: string
): Promise<{ equipos: IEquipo[]; total: number }> => {
  const offset = (page - 1) * limit;
  const searchClause = searchTerm
    ? `AND (LOWER(e.nombre) LIKE LOWER($3) OR LOWER(e.abrev) LIKE LOWER($3))`
    : "";

  const totalQuery = `SELECT COUNT(*) FROM equipos e WHERE e.fhbaja IS NULL ${searchClause};`;
  const dataQuery = `
    SELECT e.id, e.nombre, e.abrev, e.contacto, e.emailcto, e.telefonocto, e.celularcto,
      e.contrasenia, e.buenafe, e.codcateg, e.coddeporte, e.iniciales, e.codestado,
      e.archivoubic, e.archivosize, e.archivonom, e.idsede,
      TO_CHAR(e.fhcarga, 'YYYY-MM-DD') as fhcarga,
      TO_CHAR(e.fhbaja, 'YYYY-MM-DD') as fhbaja,
      e.idusuario, e.foto, e.observ, e.saldodeposito, TO_CHAR(e.fhultmod, 'YYYY-MM-DD') as fhultmod,
      s.nombre AS sede_nombre
    FROM equipos e
    LEFT JOIN wsedes s ON s.id = e.idsede
    WHERE e.fhbaja IS NULL ${searchClause}
    ORDER BY e.fhcarga DESC LIMIT $1 OFFSET $2;`;

  const totalRes = await pool.query(
    totalQuery,
    searchTerm ? [`%${searchTerm}%`] : []
  );

  const { rows } = await pool.query(
    dataQuery,
    searchTerm ? [limit, offset, `%${searchTerm}%`] : [limit, offset]
  );

  return { equipos: rows, total: parseInt(totalRes.rows[0].count, 10) };
};

// Obtener equipo por ID
export const getEquipoById = async (id: number): Promise<IEquipo | null> => {
  const { rows } = await pool.query(
    `SELECT e.id, e.nombre, e.abrev, e.contacto, e.emailcto, e.telefonocto, e.celularcto,
      e.contrasenia, e.buenafe, e.codcateg, e.coddeporte, e.iniciales, e.codestado,
      e.archivoubic, e.archivosize, e.archivonom, e.idsede,
      TO_CHAR(e.fhcarga, 'YYYY-MM-DD') as fhcarga,
      TO_CHAR(e.fhbaja, 'YYYY-MM-DD') as fhbaja,
      e.idusuario, e.foto, e.observ, e.saldodeposito, TO_CHAR(e.fhultmod, 'YYYY-MM-DD') as fhultmod,
      s.nombre AS sede_nombre
     FROM equipos e
     LEFT JOIN wsedes s ON s.id = e.idsede
     WHERE e.id = $1 AND e.fhbaja IS NULL;`,
    [id]
  );
  return rows.length ? rows[0] : null;
};

// Crear equipo
export const createEquipo = async (equipo: IEquipo): Promise<IEquipo> => {
  const { rows } = await pool.query(
    `INSERT INTO equipos (
      nombre, abrev, contacto, emailcto, telefonocto, celularcto, contrasenia,
      buenafe, codcateg, coddeporte, iniciales, codestado, archivoubic,
      archivosize, archivonom, idsede, fhcarga, idusuario, foto, observ, saldodeposito
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13,
      $14, $15, $16, NOW(), $17, $18, $19, $20
    ) RETURNING *;`,
    [
      equipo.nombre,
      equipo.abrev ?? "",
      equipo.contacto ?? "",
      equipo.emailcto ?? "",
      equipo.telefonocto ?? "",
      equipo.celularcto ?? "",
      equipo.contrasenia ?? "",
      equipo.buenafe ?? 0,
      equipo.codcateg ?? null,
      equipo.coddeporte,
      equipo.iniciales ?? "",
      equipo.codestado ?? null,
      equipo.archivoubic ?? "",
      equipo.archivosize ?? 0,
      equipo.archivonom ?? "",
      equipo.idsede ?? null,
      equipo.idusuario ?? null,
      equipo.foto ?? "",
      equipo.observ ?? "",
      equipo.saldodeposito ?? 0,
    ]
  );
  return rows[0];
};

// Actualizar equipo
export const updateEquipo = async (
  id: number,
  equipo: Partial<IEquipo>
): Promise<IEquipo | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let i = 1;

  for (const key in equipo) {
    if (
      equipo[key as keyof IEquipo] !== undefined &&
      key !== "fhultmod" &&
      key !== "sede_nombre" // 💥 importante: NO actualizar campos virtuales
    ) {
      updates.push(`${key} = $${i}`);
      values.push(equipo[key as keyof IEquipo]);
      i++;
    }
  }

  if (!updates.length) throw new Error("No hay datos para actualizar.");

  updates.push(`fhultmod = NOW()`);
  values.push(id);

  const query = `UPDATE equipos SET ${updates.join(
    ", "
  )} WHERE id = $${i} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length ? rows[0] : null;
};

// Eliminar equipo (soft delete)
export const deleteEquipo = async (id: number): Promise<boolean> => {
  const result = await pool.query(
    `UPDATE equipos SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
};
