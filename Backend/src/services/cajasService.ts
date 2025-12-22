// Backend/src/services/cajasService.ts

import { pool } from "../config/db";

interface CajaKey {
  idprofesor: number;
  fecha: string; // ✅ CAMBIADO: Ahora es fecha timestamp, no codfecha (nrofecha)
  idsede: number;
}

interface CajaData extends CajaKey {
  idtorneo?: number;
  idsubsede?: number;
  codfecha?: number; // Mantener para guardar en la tabla, pero no se usa para agrupar
  idequipo1?: number;
  idequipo2?: number;
}

/**
 * ✅ ACTUALIZADO: Agrega los equipos de un partido a wfechas_equipos
 * Si los equipos ya existen, no los duplica
 * Si son nuevos, los agrega con el siguiente orden disponible
 */
const createEquiposInCaja = async (
  client: any,
  idfecha: number,
  idequipo1?: number,
  idequipo2?: number
): Promise<void> => {
  if (!idequipo1 || !idequipo2) {
    console.log(
      `⚠️ No se pueden crear equipos en caja ${idfecha}: equipos no definidos`
    );
    return;
  }

  try {
    // ✅ Obtener todos los equipos que ya existen en la caja
    const existingQuery = `
      SELECT idequipo, orden
      FROM wfechas_equipos
      WHERE idfecha = $1
      ORDER BY orden
    `;
    const existingResult = await client.query(existingQuery, [idfecha]);
    const existingEquipos = new Set(existingResult.rows.map((r: any) => r.idequipo));

    // Calcular el siguiente orden disponible
    let nextOrden = existingResult.rows.length > 0
      ? Math.max(...existingResult.rows.map((r: any) => r.orden)) + 1
      : 1;

    const insertQuery = `
      INSERT INTO wfechas_equipos (
        idfecha,
        orden,
        idequipo,
        tipopago,
        importe,
        iddeposito,
        fhcarga
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;

    // ✅ Agregar equipo1 solo si NO existe
    if (!existingEquipos.has(idequipo1)) {
      await client.query(insertQuery, [
        idfecha,
        nextOrden++,
        idequipo1,
        1, // tipopago 1 = efectivo por defecto
        0, // importe 0 inicial
        0, // sin depósito
      ]);
      console.log(`✅ Agregado equipo ${idequipo1} a caja ${idfecha} (orden ${nextOrden - 1})`);
    } else {
      console.log(`ℹ️ Equipo ${idequipo1} ya existe en caja ${idfecha}`);
    }

    // ✅ Agregar equipo2 solo si NO existe
    if (!existingEquipos.has(idequipo2)) {
      await client.query(insertQuery, [
        idfecha,
        nextOrden++,
        idequipo2,
        1, // tipopago 1 = efectivo por defecto
        0, // importe 0 inicial
        0, // sin depósito
      ]);
      console.log(`✅ Agregado equipo ${idequipo2} a caja ${idfecha} (orden ${nextOrden - 1})`);
    } else {
      console.log(`ℹ️ Equipo ${idequipo2} ya existe en caja ${idfecha}`);
    }

  } catch (error) {
    console.error(
      `❌ Error al crear equipos en wfechas_equipos para idfecha=${idfecha}:`,
      error
    );
    throw error;
  }
};

/**
 * ✅ CAMBIADO: Busca o crea una caja usando fecha timestamp + sede + profesor
 * @returns El ID de la caja (idfecha)
 */
export const findOrCreateCaja = async (data: CajaData): Promise<number> => {
  // Validaciones
  if (!data.idprofesor || data.idprofesor === 0) {
    throw new Error("El profesor es obligatorio para abrir una caja");
  }
  if (!data.fecha) {
    throw new Error("La fecha es obligatoria para abrir una caja");
  }
  if (!data.idsede || data.idsede === 0) {
    throw new Error("La sede es obligatoria para abrir una caja");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ✅ CAMBIADO: Normalizar la fecha a YYYY-MM-DD para comparación
    const fechaNormalizada = new Date(data.fecha).toISOString().split("T")[0];

    // ✅ CAMBIADO: Buscar si ya existe una caja con la misma triple clave (fecha timestamp + sede + profesor)
    const findQuery = `
      SELECT id 
      FROM wtorneos_fechas 
      WHERE idprofesor = $1 
        AND DATE(fecha) = DATE($2)
        AND idsede = $3
        AND fhbaja IS NULL
      LIMIT 1
    `;

    const findResult = await client.query(findQuery, [
      data.idprofesor,
      fechaNormalizada,
      data.idsede,
    ]);

    // Si existe, agregar los equipos del partido a esa caja y retornar el ID
    if (findResult.rows.length > 0) {
      const existingId = findResult.rows[0].id;

      // ✅ CRÍTICO: Agregar los equipos del nuevo partido a la caja existente
      await createEquiposInCaja(client, existingId, data.idequipo1, data.idequipo2);

      await client.query("COMMIT");
      console.log(
        `✅ Caja existente encontrada: idfecha=${existingId} (profesor=${data.idprofesor}, fecha=${fechaNormalizada}, sede=${data.idsede})`
      );
      return existingId;
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
      data.fecha, // ✅ Guardar fecha completa
      data.idsede,
      data.idsubsede || null,
      data.idtorneo || null,
      data.codfecha || null, // ✅ codfecha es opcional, solo informativo
      data.idprofesor,
    ]);

    // ✅ NUEVO: Crear registros en wfechas_equipos para los equipos del partido
    await createEquiposInCaja(client, nextId, data.idequipo1, data.idequipo2);

    await client.query("COMMIT");
    console.log(
      `✅ Nueva caja creada: idfecha=${nextId} (profesor=${data.idprofesor}, fecha=${fechaNormalizada}, sede=${data.idsede})`
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
 * ✅ CAMBIADO: Verifica si un partido debe cambiar de caja
 * (cuando cambia alguno de los 3 campos clave: fecha timestamp, sede o profesor)
 */
export const shouldUpdateCaja = async (
  idpartido: number,
  newData: Partial<CajaData>
): Promise<boolean> => {
  const query = `
    SELECT idprofesor, fecha, idsede, idfecha
    FROM partidos
    WHERE id = $1
  `;

  const result = await pool.query(query, [idpartido]);
  if (result.rows.length === 0) return false;

  const current = result.rows[0];

  // ✅ CAMBIADO: Comparar fecha como timestamp (normalizado a YYYY-MM-DD)
  const currentFecha = current.fecha
    ? new Date(current.fecha).toISOString().split("T")[0]
    : null;
  const newFecha = newData.fecha
    ? new Date(newData.fecha).toISOString().split("T")[0]
    : null;

  const profesorChanged =
    newData.idprofesor !== undefined &&
    newData.idprofesor !== current.idprofesor;
  const fechaChanged = newFecha !== undefined && newFecha !== currentFecha;
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
 * ✅ ACTUALIZADO: Obtiene los datos actuales de la caja de un partido
 */
export const getCajaDataFromPartido = async (
  idpartido: number
): Promise<CajaData | null> => {
  const query = `
    SELECT 
      p.idprofesor,
      p.fecha,
      p.nrofecha as codfecha,
      p.idsede,
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
    fecha: row.fecha, // ✅ Ahora retorna fecha timestamp
    codfecha: row.codfecha, // Mantener para guardar en tabla
    idsede: row.idsede,
    idtorneo: row.idtorneo,
    idsubsede: row.idsubsede,
  };
};
