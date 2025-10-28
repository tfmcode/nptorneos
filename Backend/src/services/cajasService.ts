// Backend/src/services/cajasService.ts

import { pool } from "../config/db";

interface CajaKey {
  idprofesor: number;
  codfecha: number;
  idsede: number;
}

interface CajaData extends CajaKey {
  fecha: string;
  idtorneo?: number;
  idsubsede?: number;
}

/**
 * Busca o crea una caja en wtorneos_fechas según la triple clave
 * @returns El ID de la caja (idfecha)
 */
export const findOrCreateCaja = async (data: CajaData): Promise<number> => {
  // Validaciones
  if (!data.idprofesor || data.idprofesor === 0) {
    throw new Error("El profesor es obligatorio para abrir una caja");
  }
  if (!data.codfecha || data.codfecha === 0) {
    throw new Error("El número de fecha es obligatorio para abrir una caja");
  }
  if (!data.idsede || data.idsede === 0) {
    throw new Error("La sede es obligatoria para abrir una caja");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Buscar si ya existe una caja con la misma triple clave
    const findQuery = `
      SELECT id 
      FROM wtorneos_fechas 
      WHERE idprofesor = $1 
        AND codfecha = $2 
        AND idsede = $3
        AND fhbaja IS NULL
      LIMIT 1
    `;

    const findResult = await client.query(findQuery, [
      data.idprofesor,
      data.codfecha,
      data.idsede,
    ]);

    // Si existe, retornar ese ID
    if (findResult.rows.length > 0) {
      await client.query("COMMIT");
      console.log(
        `✅ Caja existente encontrada: idfecha=${findResult.rows[0].id} (profesor=${data.idprofesor}, fecha=${data.codfecha}, sede=${data.idsede})`
      );
      return findResult.rows[0].id;
    }

    // 2. No existe: crear nueva caja
    // Obtener el siguiente ID correlativo
    const maxIdQuery = `SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM wtorneos_fechas`;
    const maxIdResult = await client.query(maxIdQuery);
    const nextId = maxIdResult.rows[0].next_id;

    // Insertar nueva caja
    const insertQuery = `
      INSERT INTO wtorneos_fechas (
        id,
        fecha,
        idsede,
        idsubsede,
        idtorneo,
        codfecha,
        idprofesor,
        fhcarga
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id
    `;

    const insertResult = await client.query(insertQuery, [
      nextId,
      data.fecha,
      data.idsede,
      data.idsubsede || null,
      data.idtorneo || null,
      data.codfecha,
      data.idprofesor,
    ]);

    await client.query("COMMIT");
    console.log(
      `✅ Nueva caja creada: idfecha=${nextId} (profesor=${data.idprofesor}, fecha=${data.codfecha}, sede=${data.idsede})`
    );
    return insertResult.rows[0].id;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error en findOrCreateCaja:", error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Verifica si un partido debe cambiar de caja
 * (cuando cambia alguno de los 3 campos clave)
 */
export const shouldUpdateCaja = async (
  idpartido: number,
  newData: Partial<CajaData>
): Promise<boolean> => {
  const query = `
    SELECT idprofesor, nrofecha, idsede, idfecha
    FROM partidos
    WHERE id = $1
  `;

  const result = await pool.query(query, [idpartido]);
  if (result.rows.length === 0) return false;

  const current = result.rows[0];

  // ✅ CORREGIDO: Asegurar que siempre devuelve boolean
  // Si cambió alguno de los 3 campos clave, necesita nueva caja
  const profesorChanged =
    newData.idprofesor !== undefined &&
    newData.idprofesor !== current.idprofesor;
  const fechaChanged =
    newData.codfecha !== undefined && newData.codfecha !== current.nrofecha;
  const sedeChanged =
    newData.idsede !== undefined && newData.idsede !== current.idsede;

  const changed = profesorChanged || fechaChanged || sedeChanged;

  if (changed) {
    console.log(`⚠️ Partido ${idpartido} necesita cambio de caja:`, {
      profesorChanged,
      fechaChanged,
      sedeChanged,
    });
  }

  return changed;
};

/**
 * Obtiene los datos actuales de la caja de un partido
 */
export const getCajaDataFromPartido = async (
  idpartido: number
): Promise<CajaData | null> => {
  const query = `
    SELECT 
      p.idprofesor,
      p.nrofecha as codfecha,
      p.idsede,
      p.fecha,
      p.idsubsede,
      z.idtorneo
    FROM partidos p
    INNER JOIN zonas z ON p.idzona = z.id
    WHERE p.id = $1
  `;

  const result = await pool.query(query, [idpartido]);
  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    idprofesor: row.idprofesor,
    codfecha: row.codfecha,
    idsede: row.idsede,
    fecha: row.fecha,
    idtorneo: row.idtorneo,
    idsubsede: row.idsubsede,
  };
};
