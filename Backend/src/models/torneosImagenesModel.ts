import { pool } from "../config/db";

export interface ITorneoImagen {
  id?: number;
  idtorneo?: number;
  idzona?: number;
  idimagen?: number;
  descripcion?: string;
  nombre?: string;
  ubicacion?: string;
  home?: number;
  orden?: number;
  fhcarga?: string;
  usrultmod?: number;
  fhultmod?: string;
  fhbaja?: string;
}

export const getTorneoImagenById = async (
  id: number
): Promise<ITorneoImagen | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM wtorneos_imagenes WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getTorneoImagenesByTorneo = async (
  idtorneo: number
): Promise<ITorneoImagen[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM wtorneos_imagenes WHERE idtorneo = $1 AND fhbaja IS NULL ORDER BY orden ASC, id ASC;`,
    [idtorneo]
  );
  return rows;
};

export const createTorneoImagen = async (
  imagen: ITorneoImagen
): Promise<ITorneoImagen> => {
  const { rows } = await pool.query(
    `INSERT INTO wtorneos_imagenes (
      idtorneo, idzona, idimagen, descripcion, nombre, ubicacion, home, orden, fhcarga, usrultmod, fhultmod
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10
    ) RETURNING *;`,
    [
      imagen.idtorneo,
      imagen.idzona,
      imagen.idimagen,
      imagen.descripcion,
      imagen.nombre,
      imagen.ubicacion,
      imagen.home,
      imagen.orden,
      imagen.usrultmod,
      imagen.fhultmod,
    ]
  );
  return rows[0];
};

export const updateTorneoImagen = async (
  id: number,
  imagen: Partial<ITorneoImagen>
): Promise<ITorneoImagen | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in imagen) {
    if (imagen[key as keyof ITorneoImagen] !== undefined) {
      updates.push(`${key} = $${index}`);
      values.push(imagen[key as keyof ITorneoImagen]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(id);
  const query = `UPDATE wtorneos_imagenes SET ${updates.join(
    ", "
  )} WHERE id = $${index} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deleteTorneoImagen = async (id: number): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE wtorneos_imagenes SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;",
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error al eliminar imagen de torneo:", error);
    throw new Error("Error al eliminar la imagen de torneo.");
  }
};
