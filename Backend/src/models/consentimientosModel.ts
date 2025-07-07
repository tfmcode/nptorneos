import { pool } from "../config/db";

export interface IConsentimiento {
  id?: number;
  apellido?: string;
  nombres?: string;
  docnro: number;
  fechanac?: string;
  domicilio?: string;
  telefono?: string;
  obrasocial?: string;
  facebook?: string;
  idequipo?: number;
  codtipo?: number;
  idsede?: number;
  nombrecto?: string;
  relacioncto?: string;
  telefonocto?: string;
  fhcarga?: string;
  fhimpresion?: string;
  fhbaja?: string;
}

export const getConsentimientoById = async (
  id: number
): Promise<IConsentimiento | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM consentimientos WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getAllConsentimientos = async (
  page: number,
  limit: number,
  searchTerm: string
): Promise<{ consentimientos: IConsentimiento[]; total: number }> => {
  const offset = (page - 1) * limit;

  let totalQuery: string;
  let consentimientosQuery: string;
  let params: any[];

  if (searchTerm) {
    totalQuery = `SELECT COUNT(*) FROM consentimientos WHERE fhbaja IS NULL AND (CAST(docnro AS TEXT) LIKE $1 OR LOWER(apellido) LIKE LOWER($1) OR LOWER(nombres) LIKE LOWER($1));`;
    consentimientosQuery = `
      SELECT * FROM consentimientos
      WHERE fhbaja IS NULL AND (CAST(docnro AS TEXT) LIKE $1 OR LOWER(apellido) LIKE LOWER($1) OR LOWER(nombres) LIKE LOWER($1))
      ORDER BY fhcarga DESC
      LIMIT $2 OFFSET $3;`;
    params = [`%${searchTerm}%`, limit, offset];
  } else {
    totalQuery = `SELECT COUNT(*) FROM consentimientos WHERE fhbaja IS NULL;`;
    consentimientosQuery = `
      SELECT * FROM consentimientos
      WHERE fhbaja IS NULL
      ORDER BY fhcarga DESC
      LIMIT $1 OFFSET $2;`;
    params = [limit, offset];
  }

  const totalResult = await pool.query(
    totalQuery,
    searchTerm ? [`%${searchTerm}%`] : []
  );
  const { rows } = await pool.query(consentimientosQuery, params);

  return {
    consentimientos: rows,
    total: parseInt(totalResult.rows[0].count, 10),
  };
};

export const createConsentimiento = async (
  consentimiento: IConsentimiento
): Promise<IConsentimiento> => {
  for (const key in consentimiento) {
    if (consentimiento[key as keyof IConsentimiento] === "") {
      (consentimiento as any)[key] = null;
    }
  }

  const { rows } = await pool.query(
    `INSERT INTO consentimientos (
      apellido, nombres, docnro, fechanac, domicilio, telefono, obrasocial, facebook,
      idequipo, codtipo, idsede, nombrecto, relacioncto, telefonocto, fhcarga
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13, $14, NOW()
    ) RETURNING *;`,
    [
      consentimiento.apellido ?? null,
      consentimiento.nombres ?? null,
      consentimiento.docnro,
      consentimiento.fechanac ?? null,
      consentimiento.domicilio ?? null,
      consentimiento.telefono ?? null,
      consentimiento.obrasocial ?? null,
      consentimiento.facebook ?? null,
      consentimiento.idequipo ?? null,
      consentimiento.codtipo ?? null,
      consentimiento.idsede ?? null,
      consentimiento.nombrecto ?? null,
      consentimiento.relacioncto ?? null,
      consentimiento.telefonocto ?? null,
    ]
  );
  return rows[0];
};

export const updateConsentimiento = async (
  id: number,
  consentimiento: Partial<IConsentimiento>
): Promise<IConsentimiento | null> => {
  for (const key in consentimiento) {
    if (consentimiento[key as keyof IConsentimiento] === "") {
      (consentimiento as any)[key] = null;
    }
  }

  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in consentimiento) {
    if (consentimiento[key as keyof IConsentimiento] !== undefined) {
      updates.push(`${key} = $${index}`);
      values.push(consentimiento[key as keyof IConsentimiento]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(id);
  const query = `UPDATE consentimientos SET ${updates.join(
    ", "
  )}, fhimpresion = NOW() WHERE id = $${index} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deleteConsentimiento = async (id: number): Promise<boolean> => {
  const result = await pool.query(
    `UPDATE consentimientos SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
};
