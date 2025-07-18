import { pool } from "../config/db";

export interface IZonaEquipo {
  id?: number;
  idtorneo: number;
  idzona: number;
  idequipo: number;
  nombre: string;
  abrev: string;
  codestado: number;
  fhcarga?: string;
  fhbaja?: string;
  idusuario: number;
  valor_insc?: number;
  valor_fecha?: number;
}

// Get by id
export const getZonaEquipoById = async (
  id: number
): Promise<IZonaEquipo | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM zonas_equipos WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Get all by torneo
export const getZonasEquiposByTorneo = async (
  idtorneo: number
): Promise<IZonaEquipo[]> => {
  const { rows } = await pool.query(
    `SELECT z.id, z.idtorneo, z.idzona, z.idequipo, e.nombre, e.abrev, z.codestado, z.fhcarga, z.fhbaja, z.idusuario, z.valor_insc, z.valor_fecha
    FROM zonas_equipos z
    INNER JOIN wequipos e ON z.idequipo = e.id
    WHERE z.idtorneo = $1 AND z.fhbaja IS NULL
    ORDER BY z.id ASC;`,
    [idtorneo]
  );
  return rows;
};

// Create
export const createZonaEquipo = async (
  zonaEquipo: IZonaEquipo
): Promise<IZonaEquipo> => {
  const { rows } = await pool.query(
    `INSERT INTO zonas_equipos (
      idtorneo, idzona, idequipo, codestado, fhcarga, idusuario, valor_insc, valor_fecha
    ) VALUES (
      $1, $2, $3, $4, NOW(), $5, $6, $7
    ) RETURNING *;`,
    [
      zonaEquipo.idtorneo,
      zonaEquipo.idzona,
      zonaEquipo.idequipo,
      zonaEquipo.codestado,
      zonaEquipo.idusuario,
      zonaEquipo.valor_insc ?? 0,
      zonaEquipo.valor_fecha ?? 0,
    ]
  );
  return rows[0];
};

// Update
export const updateZonaEquipo = async (
  id: number,
  zonaEquipo: Partial<IZonaEquipo>
): Promise<IZonaEquipo | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  // Exclude nombre and abrev from zonas_equipos update
  for (const key in zonaEquipo) {
    if (
      zonaEquipo[key as keyof IZonaEquipo] !== undefined &&
      key !== "nombre" &&
      key !== "abrev"
    ) {
      updates.push(`${key} = $${index}`);
      values.push(zonaEquipo[key as keyof IZonaEquipo]);
      index++;
    }
  }

  if (updates.length === 0 && !zonaEquipo.nombre && !zonaEquipo.abrev) {
    throw new Error("No hay datos para actualizar.");
  }

  // Update zonas_equipos if needed
  let updatedZonaEquipo: IZonaEquipo | null = null;
  if (updates.length > 0) {
    values.push(id);
    const query = `UPDATE zonas_equipos SET ${updates.join(
      ", "
    )} WHERE id = $${index} RETURNING *;`;
    const { rows } = await pool.query(query, values);
    updatedZonaEquipo = rows.length > 0 ? rows[0] : null;
  } else {
    // If only updating nombre/abrev, fetch the current row for return
    const { rows } = await pool.query(
      `SELECT * FROM zonas_equipos WHERE id = $1;`,
      [id]
    );
    updatedZonaEquipo = rows.length > 0 ? rows[0] : null;
  }

  // Update wequipos if nombre or abrev is present
  if ((zonaEquipo.nombre || zonaEquipo.abrev) && updatedZonaEquipo) {
    const equipoUpdates: string[] = [];
    const equipoValues: any[] = [];
    let equipoIndex = 1;
    if (zonaEquipo.nombre) {
      equipoUpdates.push(`nombre = $${equipoIndex++}`);
      equipoValues.push(zonaEquipo.nombre);
    }
    if (zonaEquipo.abrev) {
      equipoUpdates.push(`abrev = $${equipoIndex++}`);
      equipoValues.push(zonaEquipo.abrev);
    }
    equipoValues.push(updatedZonaEquipo.idequipo);
    await pool.query(
      `UPDATE wequipos SET ${equipoUpdates.join(
        ", "
      )} WHERE id = $${equipoIndex};`,
      equipoValues
    );
  }

  return updatedZonaEquipo;
};

// Soft delete
export const deleteZonaEquipo = async (id: number): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE zonas_equipos SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;",
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error al eliminar zona_equipo:", error);
    throw new Error("Error al eliminar la zona_equipo.");
  }
};
