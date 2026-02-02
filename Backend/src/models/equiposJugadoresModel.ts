// Backend/src/models/equiposJugadoresModel.ts
import { pool } from "../config/db";

export interface IEquipoJugador {
  id?: number;
  idjugador: number;
  idequipo: number;
  camiseta?: number;
  capitan?: boolean;
  subcapitan?: boolean;
  codtipo?: number;
  codestado?: number;
  fhcarga?: Date;
  fhbaja?: Date | null;
  idusuario: number;
}

// Obtener jugador de equipo por ID
export const getEquipoJugadorById = async (
  id: number
): Promise<IEquipoJugador | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM wequipos_jugadores WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Obtener todos los jugadores activos de un equipo
// Incluye jugador_codestado para saber si el jugador está habilitado globalmente
export const getJugadoresByEquipo = async (
  idequipo: number
): Promise<IEquipoJugador[]> => {
  const { rows } = await pool.query(
    `SELECT ej.*, j.apellido, j.nombres, j.docnro,
            j.codestado AS jugador_codestado
     FROM wequipos_jugadores ej
     INNER JOIN jugadores j ON ej.idjugador = j.id
     WHERE ej.idequipo = $1 AND ej.fhbaja IS NULL AND j.fhbaja IS NULL
     ORDER BY j.apellido, j.nombres ASC;`,
    [idequipo]
  );
  return rows;
};

// Verificar si un jugador ya está en el equipo
export const checkJugadorInEquipo = async (
  idjugador: number,
  idequipo: number
): Promise<boolean> => {
  const { rows } = await pool.query(
    `SELECT id FROM wequipos_jugadores 
     WHERE idjugador = $1 AND idequipo = $2 AND fhbaja IS NULL
     LIMIT 1;`,
    [idjugador, idequipo]
  );
  return rows.length > 0;
};

// Crear jugador en el equipo
export const createEquipoJugador = async (
  data: IEquipoJugador
): Promise<IEquipoJugador> => {
  // Verificar si el jugador ya está en el equipo
  const exists = await checkJugadorInEquipo(data.idjugador, data.idequipo);
  if (exists) {
    throw new Error("El jugador ya está en el equipo.");
  }

  // Conversión segura de booleanos a enteros
  const capitanDb = data.capitan ? 1 : 0;
  const subcapitanDb = data.subcapitan ? 1 : 0;

  const { rows } = await pool.query(
    `INSERT INTO wequipos_jugadores (
      idjugador, idequipo, camiseta, capitan, subcapitan, codtipo, codestado, fhcarga, idusuario
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, NOW(), $8
    ) RETURNING *;`,
    [
      data.idjugador,
      data.idequipo,
      data.camiseta ?? null,
      capitanDb,
      subcapitanDb,
      data.codtipo ?? 1, // Por defecto OFICIAL
      data.codestado ?? 1,
      data.idusuario,
    ]
  );
  return rows[0];
};

// Actualizar jugador del equipo
export const updateEquipoJugador = async (
  id: number,
  data: Partial<IEquipoJugador>
): Promise<IEquipoJugador | null> => {
  // Si no hay ID, no se puede actualizar
  if (!id) {
    throw new Error("ID es requerido para actualizar.");
  }

  // Manejo de capitán único
  if (data.capitan === true && data.idequipo) {
    await pool.query(
      `UPDATE wequipos_jugadores SET capitan = 0 WHERE idequipo = $1 AND id <> $2 AND fhbaja IS NULL;`,
      [data.idequipo, id]
    );
  }

  // Manejo de subcapitán único
  if (data.subcapitan === true && data.idequipo) {
    await pool.query(
      `UPDATE wequipos_jugadores SET subcapitan = 0 WHERE idequipo = $1 AND id <> $2 AND fhbaja IS NULL;`,
      [data.idequipo, id]
    );
  }

  // Preparar valores convertidos para booleanos si están presentes
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  const dataCopy: Partial<IEquipoJugador> = { ...data };

  // Conversión de booleanos
  if (typeof data.capitan === "boolean") {
    dataCopy.capitan = data.capitan ? 1 : (0 as any);
  }

  if (typeof data.subcapitan === "boolean") {
    dataCopy.subcapitan = data.subcapitan ? 1 : (0 as any);
  }

  // Construir la consulta de actualización
  for (const key in dataCopy) {
    if (dataCopy[key as keyof IEquipoJugador] !== undefined && key !== "id") {
      updates.push(`${key} = $${index}`);
      values.push(dataCopy[key as keyof IEquipoJugador]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(id);

  const query = `UPDATE wequipos_jugadores SET ${updates.join(
    ", "
  )} WHERE id = $${index} AND fhbaja IS NULL RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

// Soft delete
export const deleteEquipoJugador = async (id: number): Promise<boolean> => {
  try {
    if (!id) {
      throw new Error("ID es requerido para eliminar.");
    }

    const result = await pool.query(
      `UPDATE wequipos_jugadores SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error al eliminar jugador del equipo:", error);
    throw new Error("Error al eliminar jugador del equipo.");
  }
};
