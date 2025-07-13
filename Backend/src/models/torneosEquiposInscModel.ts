import { pool } from "../config/db";

export interface ITorneosEquiposInsc {
  id?: number;
  idtorneo?: number;
  idequipo?: number;
  inscrip?: number;
  deposito?: number;
  fhcarga?: Date | string;
  ivainscrip?: number;
  ivadeposito?: number;
  idpartido?: number;
}

export const getAllTorneosEquiposInsc = async (
  page: number,
  limit: number,
  searchTerm: string
): Promise<{ inscripciones: ITorneosEquiposInsc[]; total: number }> => {
  const offset = (page - 1) * limit;

  let totalQuery: string;
  let inscripcionesQuery: string;
  let params: any[];

  if (searchTerm) {
    totalQuery = `
      SELECT COUNT(*) 
      FROM wtorneos_equipos_insc wei
      LEFT JOIN wtorneos t ON wei.idtorneo = t.id
      LEFT JOIN wequipos e ON wei.idequipo = e.id
      WHERE (
        LOWER(t.nombre) LIKE LOWER($1) OR 
        LOWER(e.nombre) LIKE LOWER($1)
      );
    `;

    inscripcionesQuery = `
      SELECT 
        wei.id, wei.idtorneo, wei.idequipo, wei.inscrip, wei.deposito,
        wei.fhcarga, wei.ivainscrip, wei.ivadeposito, wei.idpartido,
        t.nombre as torneo_nombre, e.nombre as equipo_nombre
      FROM wtorneos_equipos_insc wei
      LEFT JOIN wtorneos t ON wei.idtorneo = t.id
      LEFT JOIN wequipos e ON wei.idequipo = e.id
      WHERE (
        LOWER(t.nombre) LIKE LOWER($1) OR 
        LOWER(e.nombre) LIKE LOWER($1)
      )
      ORDER BY wei.fhcarga DESC 
      LIMIT $2 OFFSET $3;
    `;

    params = [`%${searchTerm}%`, limit, offset];
  } else {
    totalQuery = `SELECT COUNT(*) FROM wtorneos_equipos_insc;`;

    inscripcionesQuery = `
      SELECT 
        wei.id, wei.idtorneo, wei.idequipo, wei.inscrip, wei.deposito,
        wei.fhcarga, wei.ivainscrip, wei.ivadeposito, wei.idpartido,
        t.nombre as torneo_nombre, e.nombre as equipo_nombre
      FROM wtorneos_equipos_insc wei
      LEFT JOIN wtorneos t ON wei.idtorneo = t.id
      LEFT JOIN wequipos e ON wei.idequipo = e.id
      ORDER BY wei.fhcarga DESC 
      LIMIT $1 OFFSET $2;
    `;

    params = [limit, offset];
  }

  const totalResult = await pool.query(
    totalQuery,
    searchTerm ? [`%${searchTerm}%`] : []
  );
  const { rows } = await pool.query(inscripcionesQuery, params);

  return {
    inscripciones: rows,
    total: parseInt(totalResult.rows[0].count, 10),
  };
};

export const getTorneosEquiposInscById = async (
  id: number
): Promise<ITorneosEquiposInsc | null> => {
  const { rows } = await pool.query(
    `SELECT 
      wei.id, wei.idtorneo, wei.idequipo, wei.inscrip, wei.deposito,
      wei.fhcarga, wei.ivainscrip, wei.ivadeposito, wei.idpartido,
      t.nombre as torneo_nombre, e.nombre as equipo_nombre
    FROM wtorneos_equipos_insc wei
    LEFT JOIN wtorneos t ON wei.idtorneo = t.id
    LEFT JOIN wequipos e ON wei.idequipo = e.id
    WHERE wei.id = $1;`,
    [id]
  );

  return rows.length > 0 ? rows[0] : null;
};

export const createTorneosEquiposInsc = async (
  data: ITorneosEquiposInsc
): Promise<ITorneosEquiposInsc> => {
  const {
    idtorneo,
    idequipo,
    inscrip = 0,
    deposito = 0,
    ivainscrip = 0,
    ivadeposito = 0,
    idpartido = 0,
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO wtorneos_equipos_insc (
      idtorneo, idequipo, inscrip, deposito, ivainscrip, ivadeposito, idpartido, fhcarga
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, NOW()
    ) RETURNING *;`,
    [idtorneo, idequipo, inscrip, deposito, ivainscrip, ivadeposito, idpartido]
  );

  return rows[0];
};

export const updateTorneosEquiposInsc = async (
  id: number,
  data: Partial<ITorneosEquiposInsc>
): Promise<ITorneosEquiposInsc | null> => {
  const camposValidos = [
    "idtorneo",
    "idequipo",
    "inscrip",
    "deposito",
    "ivainscrip",
    "ivadeposito",
    "idpartido",
  ];

  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const [key, value] of Object.entries(data)) {
    if (camposValidos.includes(key) && value !== undefined) {
      updates.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay campos válidos para actualizar.");
  }

  values.push(id);

  const { rows } = await pool.query(
    `UPDATE wtorneos_equipos_insc 
     SET ${updates.join(", ")} 
     WHERE id = $${index} 
     RETURNING *;`,
    values
  );

  return rows.length > 0 ? rows[0] : null;
};

export const deleteTorneosEquiposInsc = async (
  id: number
): Promise<boolean> => {
  const { rowCount } = await pool.query(
    `DELETE FROM wtorneos_equipos_insc WHERE id = $1;`,
    [id]
  );

  return rowCount !== null && rowCount > 0;
};

export const getTorneosEquiposInscByTorneo = async (
  idtorneo: number
): Promise<ITorneosEquiposInsc[]> => {
  const { rows } = await pool.query(
    `SELECT 
      wei.id, wei.idtorneo, wei.idequipo, wei.inscrip, wei.deposito,
      wei.fhcarga, wei.ivainscrip, wei.ivadeposito, wei.idpartido,
      t.nombre as torneo_nombre, e.nombre as equipo_nombre
    FROM wtorneos_equipos_insc wei
    LEFT JOIN wtorneos t ON wei.idtorneo = t.id
    LEFT JOIN wequipos e ON wei.idequipo = e.id
    WHERE wei.idtorneo = $1
    ORDER BY wei.fhcarga DESC;`,
    [idtorneo]
  );

  return rows;
};

export const getTorneosEquiposInscByEquipo = async (
  idequipo: number
): Promise<ITorneosEquiposInsc[]> => {
  const { rows } = await pool.query(
    `SELECT 
      wei.id, wei.idtorneo, wei.idequipo, wei.inscrip, wei.deposito,
      wei.fhcarga, wei.ivainscrip, wei.ivadeposito, wei.idpartido,
      t.nombre as torneo_nombre, e.nombre as equipo_nombre
    FROM wtorneos_equipos_insc wei
    LEFT JOIN wtorneos t ON wei.idtorneo = t.id
    LEFT JOIN wequipos e ON wei.idequipo = e.id
    WHERE wei.idequipo = $1
    ORDER BY wei.fhcarga DESC;`,
    [idequipo]
  );

  return rows;
};
