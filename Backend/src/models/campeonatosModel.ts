import { pool } from "../config/db";

export interface ICampeonato {
  id?: number;
  nombre: string;
  coddeporte: number;
  codestado?: number;
  fhcarga?: Date;
  fhbaja?: Date | null;
  fhultmod?: Date;
  usrultmod?: number;
}

// 🔍 Obtener todos los campeonatos activos
export const getAllCampeonatos = async (): Promise<ICampeonato[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM campeonatos WHERE fhbaja IS NULL ORDER BY id DESC;`
  );
  return rows;
};

// 🔍 Obtener un campeonato por ID
export const getCampeonatoById = async (
  id: number
): Promise<ICampeonato | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM campeonatos WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

// 🆕 Crear un campeonato
export const createCampeonato = async (
  campeonato: ICampeonato
): Promise<ICampeonato> => {
  const { rows } = await pool.query(
    `INSERT INTO campeonatos (nombre, coddeporte, codestado, fhcarga, fhultmod, usrultmod) 
     VALUES ($1, $2, $3, NOW(), NOW(), $4) 
     RETURNING *;`,
    [
      campeonato.nombre,
      campeonato.coddeporte,
      campeonato.codestado,
      campeonato.usrultmod,
    ]
  );
  return rows[0];
};

// 🔄 Actualizar un campeonato
export const updateCampeonato = async (
  id: number,
  campeonato: Partial<ICampeonato>
): Promise<ICampeonato | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in campeonato) {
    if (
      campeonato[key as keyof ICampeonato] !== undefined &&
      key !== "fhultmod"
    ) {
      updates.push(`${key} = $${index}`);
      values.push(campeonato[key as keyof ICampeonato]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  // Agregamos `fhultmod` manualmente para evitar duplicación
  updates.push(`fhultmod = NOW()`);

  values.push(id);
  const query = `UPDATE campeonatos SET ${updates.join(
    ", "
  )} WHERE id = $${index} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

// ❌ **Soft Delete (Marcar campeonato como dado de baja)**
export const deleteCampeonato = async (id: number): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE campeonatos SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;",
      [id]
    );

    return (result.rowCount ?? 0) > 0; // ✅ Aseguramos que nunca sea null
  } catch (error) {
    console.error("❌ Error al eliminar campeonato:", error);
    throw new Error("Error al eliminar el campeonato.");
  }
};
