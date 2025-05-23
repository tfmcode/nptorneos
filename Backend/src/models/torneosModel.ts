import { pool } from "../config/db";

export interface ITorneo {
  id?: number
  nombre: string
  abrev: string
  anio: number
  idcampeonato: number
  idsede: number
  codestado: number
  codtipoestado: number
  cposicion: number
  cpromedio: number
  codmodelo: number
  codtipo: number
  cantmin: number
  torneodefault: number
  fotojugador: number
  idpadre?: number
  idgaleria?: number
  valor_insc?: number
  valor_fecha?: number
  individual: number
  valor_arbitro?: number
  valor_cancha?: number
  valor_medico?: number
  excluir_res: number
  fhcarga?: string
  fhbaja?: string
  idusuario: number
  sas: number
}

export const getTorneoById = async (id: number): Promise<ITorneo | null> => {
  const { rows } = await pool.query(
    `SELECT id, nombre, abrev, anio, idcampeonato, idsede, codestado, codtipoestado, cposicion, cpromedio, codmodelo, codtipo, cantmin, torneodefault, fotojugador, idpadre, idgaleria, valor_insc, valor_fecha, individual, valor_arbitro, valor_cancha, valor_medico, excluir_res, fhcarga, idusuario, sas FROM wtorneos WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getAllTorneos = async (
  page: number,
  limit: number,
  searchTerm: string
): Promise<{ torneos: ITorneo[]; total: number }> => {
  const offset = (page - 1) * limit;
  const searchQuery = searchTerm
    ? `AND (LOWER(nombre) LIKE LOWER($3) OR LOWER(abrev) LIKE LOWER($3))`
    : "";

  const totalQuery = `SELECT COUNT(*) FROM wtorneos WHERE fhbaja IS NULL ${searchQuery};`;
  const torneosQuery = `
    SELECT id, nombre, abrev, anio, idcampeonato, idsede, codestado, codtipoestado, cposicion, cpromedio, codmodelo, codtipo, cantmin, torneodefault, fotojugador, idpadre, idgaleria, valor_insc, valor_fecha, individual, valor_arbitro, valor_cancha, valor_medico, excluir_res, fhcarga, idusuario, sas FROM wtorneos WHERE fhbaja IS NULL 
    ${searchQuery} ORDER BY fhcarga DESC LIMIT $1 OFFSET $2;`

  const totalResult = await pool.query(
    totalQuery,
    searchTerm ? [`%${searchTerm}%`] : []
  );
  const { rows } = await pool.query(
    torneosQuery,
    searchTerm ? [limit, offset, `%${searchTerm}%`] : [limit, offset]
  );

  return {
    torneos: rows,
    total: parseInt(totalResult.rows[0].count, 10),
  };
};

export const createTorneo = async (torneo: ITorneo): Promise<ITorneo> => {
  const { rows } = await pool.query(
    `INSERT INTO wtorneos (
      nombre, abrev, anio, idcampeonato, idsede, codestado, codtipoestado,
      cposicion, cpromedio, codmodelo, codtipo, cantmin, torneodefault,
      fotojugador, idpadre, idgaleria, valor_insc, valor_fecha, individual,
      valor_arbitro, valor_cancha, valor_medico, excluir_res, fhcarga,
      idusuario, sas
    ) 
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
      $17, $18, $19, $20, $21, $22, $23, NOW(), $24, $25
    ) 
    RETURNING *;`,
    [
      torneo.nombre,
      torneo.abrev,
      torneo.anio,
      torneo.idcampeonato,
      torneo.idsede,
      torneo.codestado,
      torneo.codtipoestado,
      torneo.cposicion,
      torneo.cpromedio,
      torneo.codmodelo,
      torneo.codtipo,
      torneo.cantmin,
      torneo.torneodefault,
      torneo.fotojugador,
      torneo.idpadre,
      torneo.idgaleria,
      torneo.valor_insc,
      torneo.valor_fecha,
      torneo.individual,
      torneo.valor_arbitro,
      torneo.valor_cancha,
      torneo.valor_medico,
      torneo.excluir_res,
      torneo.idusuario,
      torneo.sas
    ]
  );
  return rows[0];
};

export const updateTorneo = async (
  id: number,
  torneo: Partial<ITorneo>
): Promise<ITorneo | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in torneo) {
    if (torneo[key as keyof ITorneo] !== undefined) {
      updates.push(`${key} = $${index}`);
      values.push(torneo[key as keyof ITorneo]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(id);
  const query = `UPDATE wtorneos SET ${updates.join(
    ", "
  )} WHERE id = $${index} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deleteTorneo = async (id: number): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE wtorneos SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;",
      [id]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error al eliminar torneo:", error);
    throw new Error("Error al eliminar el torneo.");
  }
};
