import { pool } from "../config/db";

export interface IZona {
  id?: number;
  idtorneo?: number;
  nombre: string;
  abrev: string;
  codcantfechas?: number;
  codfechaactual?: number;
  codestado?: number;
  fhcarga?: string;
  fhbaja?: string;
  idusuario: number;
  amistoso?: number;
}

export const getZonaById = async (id: number): Promise<IZona | null> => {
  const { rows } = await pool.query(
    `SELECT id, idtorneo, nombre, abrev, codcantfechas, codfechaactual, 
     codestado, fhcarga, idusuario, amistoso 
     FROM zonas 
     WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getZonaByTorneoId = async (id: number): Promise<IZona[]> => {
  const { rows } = await pool.query(
    `SELECT id, idtorneo, nombre, abrev, codcantfechas, codfechaactual, 
     codestado, fhcarga, idusuario, amistoso, fhbaja
     FROM zonas 
     WHERE idtorneo = $1 AND fhbaja IS NULL
     ORDER BY id ASC;`,
    [id]
  );
  return rows;
};

export const createZona = async (zona: IZona): Promise<IZona> => {
  const { rows } = await pool.query(
    `INSERT INTO zonas (
      idtorneo, nombre, abrev, codcantfechas, codfechaactual,
      codestado, fhcarga, idusuario, amistoso
    ) 
    VALUES (
      $1, $2, $3, $4, $5, $6, NOW(), $7, $8
    ) 
    RETURNING *;`,
    [
      zona.idtorneo,
      zona.nombre,
      zona.abrev,
      zona.codcantfechas,
      zona.codfechaactual,
      zona.codestado,
      zona.idusuario,
      zona.amistoso ?? 0,
    ]
  );
  return rows[0];
};

export const updateZona = async (
  id: number,
  zona: Partial<IZona>
): Promise<IZona | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in zona) {
    if (zona[key as keyof IZona] !== undefined) {
      updates.push(`${key} = $${index}`);
      values.push(zona[key as keyof IZona]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(id);
  const query = `UPDATE zonas SET ${updates.join(
    ", "
  )} WHERE id = $${index} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deleteZona = async (id: number): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE zonas SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;",
      [id]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error al eliminar zona:", error);
    throw new Error("Error al eliminar la zona.");
  }
};
