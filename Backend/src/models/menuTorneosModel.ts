import { pool } from "../config/db";

export interface IMenuTorneo {
  idopcion?: number;
  idtorneo?: number | null;
  descripcion?: string | null;
  orden?: number | null;
}

export const getMenuTorneosByOpcion = async (
  idopcion: number
): Promise<IMenuTorneo[]> => {
  const { rows } = await pool.query(
    `SELECT idopcion, idtorneo, descripcion, orden
     FROM menutorneos
     WHERE idopcion = $1
     ORDER BY orden ASC;`,
    [idopcion]
  );
  return rows;
};

export const createMenuTorneo = async (
  menuTorneo: IMenuTorneo
): Promise<IMenuTorneo> => {
  const { rows } = await pool.query(
    `INSERT INTO menutorneos (
      idopcion, idtorneo, descripcion, orden
    ) VALUES (
      $1, $2, $3, $4
    )
    RETURNING *;`,
    [
      menuTorneo.idopcion ?? null,
      menuTorneo.idtorneo ?? null,
      menuTorneo.descripcion ?? null,
      menuTorneo.orden ?? null,
    ]
  );
  return rows[0];
};

export const updateMenuTorneo = async (
  idopcion: number,
  orden: number,
  updates: Partial<IMenuTorneo>
): Promise<IMenuTorneo | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in updates) {
    if (updates[key as keyof IMenuTorneo] !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(updates[key as keyof IMenuTorneo]);
      index++;
    }
  }

  if (fields.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(idopcion);
  values.push(orden);

  const query = `UPDATE menutorneos SET ${fields.join(", ")}
    WHERE idopcion = $${index} AND orden = $${index + 1}
    RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deleteMenuTorneo = async (
  idopcion: number,
  orden: number
): Promise<boolean> => {
  const { rowCount } = await pool.query(
    `DELETE FROM menutorneos
     WHERE idopcion = $1 AND orden = $2;`,
    [idopcion, orden]
  );
  return (rowCount ?? 0) > 0;
};
