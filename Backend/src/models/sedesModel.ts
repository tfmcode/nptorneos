import { pool } from "../config/db";

export interface ISede {
  id?: number;
  nombre: string;
  domicilio: string;
  provincia?: string;
  localidad?: string;
  cpostal?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  emailcto?: string;
  telefonocto?: string;
  celularcto?: string;
  longitud?: string;
  latitud?: string;
  descripcion?: string;
  mapa?: number;
  codestado?: number;
  fhcarga?: Date;
  fhbaja?: Date | null;
}

export const getAllSedes = async (): Promise<ISede[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM wsedes WHERE fhbaja IS NULL ORDER BY id DESC;`
  );
  return rows;
};

export const getSedeById = async (id: number): Promise<ISede | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM wsdes WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const createSede = async (sede: ISede): Promise<ISede> => {
  const { rows } = await pool.query(
    `INSERT INTO wsedes (nombre, domicilio, provincia, localidad, cpostal, telefono, email, contacto, emailcto, telefonocto, celularcto, longitud, latitud, descripcion, mapa, codestado) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
     RETURNING *;`,
    [
      sede.nombre,
      sede.domicilio,
      sede.provincia,
      sede.localidad,
      sede.cpostal,
      sede.telefono,
      sede.email,
      sede.contacto,
      sede.emailcto,
      sede.telefonocto,
      sede.celularcto,
      sede.longitud,
      sede.latitud,
      sede.descripcion,
      sede.mapa,
      sede.codestado,
    ]
  );
  return rows[0];
};

export const updateSede = async (
  id: number,
  sede: Partial<ISede>
): Promise<ISede | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in sede) {
    if (sede[key as keyof ISede] !== undefined) {
      updates.push(`${key} = $${index}`);
      values.push(sede[key as keyof ISede]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(id);
  const query = `UPDATE wsedes SET ${updates.join(
    ", "
  )} WHERE id = $${index} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deleteSede = async (id: number): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE wsedes SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;",
      [id]
    );

    return (result.rowCount ?? 0) > 0; 
  } catch (error) {
    console.error("❌ Error al eliminar sede:", error);
    throw new Error("Error al eliminar la sede.");
  }
};
