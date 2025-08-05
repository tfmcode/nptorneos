import { pool } from "../config/db";

export interface ICodificador {
  id: number;
  idcodificador: number;
  descripcion?: string;
  codestado?: string;
  fhcarga?: Date;
  fhbaja?: Date | null;
}

export const getAllCodificadores = async (): Promise<ICodificador[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM codificadores WHERE fhbaja IS NULL ORDER BY idcodificador, id;`
  );
  return rows;
};

export const getCodificadorById = async (
  id: number,
  idcodificador: number
): Promise<ICodificador | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM codificadores WHERE id = $1 AND idcodificador = $2 AND fhbaja IS NULL;`,
    [id, idcodificador]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const createCodificador = async (
  codificador: Omit<ICodificador, "id" | "fhcarga">
): Promise<ICodificador> => {
  const { rows: maxIdRows } = await pool.query(
    `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM codificadores WHERE idcodificador = $1;`,
    [codificador.idcodificador]
  );

  const nextId = maxIdRows[0].next_id;

  const { rows } = await pool.query(
    `INSERT INTO codificadores (id, idcodificador, descripcion, codestado, fhcarga, fhbaja) 
     VALUES ($1, $2, $3, $4, NOW(), NULL) RETURNING *;`,
    [
      nextId,
      codificador.idcodificador,
      codificador.descripcion,
      codificador.codestado,
    ]
  );

  return rows[0];
};

export const updateCodificador = async (
  id: number,
  idcodificador: number,
  codificador: Partial<ICodificador>
): Promise<ICodificador | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in codificador) {
    if (codificador[key as keyof ICodificador] !== undefined) {
      updates.push(`${key} = $${index}`);
      values.push(codificador[key as keyof ICodificador]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(id, idcodificador);
  const query = `UPDATE codificadores SET ${updates.join(
    ", "
  )} WHERE id = $${index} AND idcodificador = $${index + 1} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deleteCodificador = async (
  id: number,
  idcodificador: number
): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE codificadores SET fhbaja = NOW() WHERE id = $1 AND idcodificador = $2 AND fhbaja IS NULL;",
      [id, idcodificador]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error al eliminar codificador:", error);
    throw new Error("Error al eliminar el codificador.");
  }
};
