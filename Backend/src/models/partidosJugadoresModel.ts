import { pool } from "../config/db";

export interface PartidoJugadorExtendido {
  idjugador: number;
  nombre: string;
  docnro: number;
  marca: number;
  sancion: number;
  listanegra: number;
  camiseta: string;
  goles: number;
  amarillo: number;
  azul: number;
  rojo: number;
  tipo: number;
  foto: string;
}

export interface PartidoJugadorInput {
  idjugador: number;
  goles: number;
  camiseta: string;
  amarilla: number;
  azul: number;
  roja: number;
}

export const getJugadoresDeEquipoEnPartido = async (
  idpartido: number,
  idequipo: number
): Promise<PartidoJugadorExtendido[]> => {
  const client = await pool.connect();
  try {
    console.log("🔍 Model - Parámetros recibidos:", { idpartido, idequipo });

    await client.query("BEGIN");

    // Verificar que el partido existe y obtener su fecha
    console.log("🔍 Consultando fecha del partido...");
    const fechaResult = await client.query(
      "SELECT fecha FROM partidos WHERE id = $1",
      [idpartido]
    );

    if (fechaResult.rows.length === 0) {
      throw new Error(`Partido con ID ${idpartido} no encontrado`);
    }

    const fechapartido: string = fechaResult.rows[0]?.fecha;
    console.log("✅ Fecha del partido:", fechapartido);

    // Crear tabla temporal - CAMBIO CRÍTICO: docnro BIGINT en lugar de INT
    console.log("🔍 Creando tabla temporal...");
    await client.query(`
      CREATE TEMP TABLE t_detalle (
        idjugador INT,
        nombre VARCHAR(100),
        docnro BIGINT,  -- ← CAMBIO CRÍTICO: BIGINT en lugar de INT
        marca SMALLINT,
        sancion INT,
        listanegra INT,
        camiseta VARCHAR(5),
        goles INT,
        amarillo INT,
        azul INT,
        rojo INT,
        tipo INT,
        estadoeq INT,
        estadojug INT,
        foto VARCHAR(100)
      );
    `);

    // Insertar jugadores del equipo
    console.log("🔍 Insertando jugadores del equipo...");
    const insertResult = await client.query(
      `
      INSERT INTO t_detalle
      SELECT
        q.idjugador,
        CONCAT(j.apellido, ' ', j.nombres) AS nombre,
        j.docnro,
        0 AS marca,
        0 AS sancion,
        0 AS listanegra,
        '' AS camiseta,
        0 AS goles,
        0 AS amarillo,
        0 AS azul,
        0 AS rojo,
        q.codtipo AS tipo,
        q.codestado AS estadoeq,
        j.codestado AS estadojug,
        j.foto
      FROM wequipos_jugadores q
      JOIN jugadores j ON q.idjugador = j.id
      WHERE q.idequipo = $1
        AND q.fhbaja IS NULL
        AND j.fhbaja IS NULL
        AND q.codestado = 1
        AND j.codestado = 1
    `,
      [idequipo]
    );

    console.log("✅ Jugadores insertados:", insertResult.rowCount);

    // Actualizar con datos del partido
    console.log("🔍 Actualizando con datos del partido...");
    const updateResult = await client.query(
      `
      UPDATE t_detalle d
      SET
        marca = 1,
        camiseta = p.camiseta,
        goles = p.goles,
        amarillo = p.amarillas,
        azul = p.azules,
        rojo = p.rojas
      FROM partidos_jugadores p
      WHERE d.idjugador = p.idjugador AND p.idpartido = $1
    `,
      [idpartido]
    );

    console.log(
      "✅ Registros actualizados con datos del partido:",
      updateResult.rowCount
    );

    // Actualizar sanciones
    console.log("🔍 Actualizando sanciones...");
    const sancionesResult = await client.query(
      `
      UPDATE t_detalle d
      SET sancion = 1
      FROM sanciones s
      WHERE d.idjugador = s.idjugador
        AND s.codestado = 1
        AND s.fhbaja IS NULL
        AND $1::timestamp BETWEEN s.fecha AND s.fechafin
    `,
      [fechapartido]
    );

    console.log("✅ Sanciones actualizadas:", sancionesResult.rowCount);

    // Actualizar lista negra
    console.log("🔍 Actualizando lista negra...");
    const listaNegraResult = await client.query(`
      UPDATE t_detalle d
      SET listanegra = 1
      FROM listanegra l
      WHERE d.idjugador = l.idjugador
        AND l.fhbaja IS NULL
        AND l.codestado = 1
    `);

    console.log("✅ Lista negra actualizada:", listaNegraResult.rowCount);

    // Limpiar registros inactivos
    console.log("🔍 Limpiando registros inactivos...");
    const cleanResult = await client.query(`
      DELETE FROM t_detalle
      WHERE marca = 0 AND (estadoeq = 0 OR estadojug = 0)
    `);

    console.log("✅ Registros limpiados:", cleanResult.rowCount);

    // Obtener resultado final
    console.log("🔍 Obteniendo resultado final...");
    const result = await client.query(`
      SELECT
        idjugador,
        nombre,
        docnro,
        marca,
        sancion,
        listanegra,
        camiseta,
        goles,
        amarillo,
        azul,
        rojo,
        tipo,
        foto
      FROM t_detalle
      ORDER BY nombre
    `);

    console.log(
      "✅ Resultado final obtenido:",
      result.rows.length,
      "jugadores"
    );

    await client.query("ROLLBACK");
    return result.rows;
  } catch (error) {
    console.error("❌ Error en getJugadoresDeEquipoEnPartido:", error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Función upsertPartidoJugador SIN la validación de equipo (temporalmente)
export const upsertPartidoJugador = async (
  idpartido: number,
  idequipo: number,
  data: PartidoJugadorInput
) => {
  const { idjugador, goles, camiseta, amarilla, azul, roja } = data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ⚠️ COMENTADO TEMPORALMENTE PARA PRUEBAS
    // // Verificar que el jugador pertenece al equipo
    // const jugadorEnEquipo = await client.query(
    //   `SELECT 1 FROM wequipos_jugadores wej
    //    WHERE wej.idequipo = $1 AND wej.idjugador = $2 AND wej.fhbaja IS NULL AND wej.codestado = 1`,
    //   [idequipo, idjugador]
    // );

    // if (jugadorEnEquipo.rows.length === 0) {
    //   throw new Error("El jugador no pertenece a este equipo o está inactivo");
    // }

    // Verificar si ya existe el registro
    const exists = await client.query(
      "SELECT 1 FROM partidos_jugadores WHERE idpartido = $1 AND idjugador = $2",
      [idpartido, idjugador]
    );

    if ((exists?.rowCount ?? 0) > 0) {
      // Actualizar registro existente
      await client.query(
        `UPDATE partidos_jugadores
         SET goles = $1, camiseta = $2, amarillas = $3, azules = $4, rojas = $5, fhultmod = NOW()
         WHERE idpartido = $6 AND idjugador = $7`,
        [goles, camiseta, amarilla, azul, roja, idpartido, idjugador]
      );
    } else {
      // Crear nuevo registro
      await client.query(
        `INSERT INTO partidos_jugadores
         (idpartido, idequipo, idjugador, goles, camiseta, amarillas, azules, rojas, fhcarga)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [idpartido, idequipo, idjugador, goles, camiseta, amarilla, azul, roja]
      );
    }

    await client.query("COMMIT");
    return { success: true, message: "Jugador guardado correctamente" };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en upsertPartidoJugador:", error);
    throw error;
  } finally {
    client.release();
  }
};

