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
  coddeporte?: number;
  iniciales?: string;
  codestado?: number;
  archivoubic?: string;
  archivosize?: number;
  archivonom?: string;
  idsede?: number;
  fhcarga?: Date | string;
  fhbaja?: Date | string | null;
  idusuario?: number;
  foto?: string;
  observ?: string;
  saldodeposito?: number;
  fhultmod?: Date | string;
}

export const getEquipoById = async (id: number): Promise<IEquipo | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM wequipos WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return rows.length ? rows[0] : null;
};

export const getAllEquipos = async (
  page: number,
  limit: number,
  searchTerm = ""
): Promise<{ equipos: IEquipo[]; total: number }> => {
  const offset = (page - 1) * limit;

  const like = `%${searchTerm.toLowerCase()}%`;
  const params: any[] = searchTerm
    ? [like, like, limit, offset]
    : [limit, offset];

  const totalQuery = searchTerm
    ? `SELECT COUNT(*) FROM wequipos
       WHERE fhbaja IS NULL AND (LOWER(nombre) LIKE $1 OR LOWER(abrev) LIKE $2);`
    : `SELECT COUNT(*) FROM wequipos WHERE fhbaja IS NULL;`;

  const dataQuery = searchTerm
    ? `SELECT * FROM wequipos
       WHERE fhbaja IS NULL AND (LOWER(nombre) LIKE $1 OR LOWER(abrev) LIKE $2)
       ORDER BY fhcarga DESC
       LIMIT $3 OFFSET $4;`
    : `SELECT * FROM wequipos
       WHERE fhbaja IS NULL
       ORDER BY fhcarga DESC
       LIMIT $1 OFFSET $2;`;

  const totalRes = await pool.query(totalQuery, searchTerm ? [like, like] : []);
  const { rows } = await pool.query(dataQuery, params);

  return {
    equipos: rows,
    total: parseInt(totalRes.rows[0].count, 10),
  };
};

export const createEquipo = async (data: IEquipo): Promise<IEquipo> => {
  const {
    nombre,
    abrev,
    contacto,
    emailcto,
    telefonocto,
    celularcto,
    contrasenia,
    buenafe,
    codcateg,
    coddeporte,
    iniciales,
    codestado = 1,
    archivoubic,
    archivosize,
    archivonom,
    idsede,
    idusuario,
    foto,
    observ,
    saldodeposito = 0,
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO wequipos (
      nombre, abrev, contacto, emailcto, telefonocto, celularcto, contrasenia,
      buenafe, codcateg, coddeporte, iniciales, codestado, archivoubic,
      archivosize, archivonom, idsede, fhcarga, idusuario, foto, observ, saldodeposito
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,
      $8,$9,$10,$11,$12,$13,
      $14,$15,$16,NOW(),$17,$18,$19,$20
    )
    RETURNING *;`,
    [
      nombre,
      abrev,
      contacto,
      emailcto,
      telefonocto,
      celularcto,
      contrasenia,
      buenafe,
      codcateg,
      coddeporte,
      iniciales,
      codestado,
      archivoubic,
      archivosize,
      archivonom,
      idsede,
      idusuario,
      foto,
      observ,
      saldodeposito,
    ]
  );
  return rows[0];
};

export const updateEquipo = async (
  id: number,
  data: Partial<IEquipo>
): Promise<IEquipo | null> => {
  const camposValidos = [
    "nombre",
    "abrev",
    "contacto",
    "emailcto",
    "telefonocto",
    "celularcto",
    "contrasenia",
    "buenafe",
    "codcateg",
    "coddeporte",
    "iniciales",
    "codestado",
    "archivoubic",
    "archivosize",
    "archivonom",
    "idsede",
    "idusuario",
    "foto",
    "observ",
    "saldodeposito",
  ];

  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const campo of camposValidos) {
    const val = data[campo as keyof IEquipo];
    if (val !== undefined) {
      updates.push(`${campo} = $${idx}`);
      values.push(val);
      idx++;
    }
  }

  if (!updates.length) throw new Error("No hay datos para actualizar.");

  updates.push(`fhultmod = NOW()`); 
  values.push(id);

  const q = `UPDATE wequipos SET ${updates.join(
    ", "
  )} WHERE id = $${idx} RETURNING *;`;
  const { rows } = await pool.query(q, values);

  return rows.length ? rows[0] : null;
};

export const deleteEquipo = async (id: number): Promise<boolean> => {
  const res = await pool.query(
    `UPDATE wequipos SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return (res.rowCount ?? 0) > 0; 
};
