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
    await client.query("BEGIN");

    const fechaResult = await client.query(
      "SELECT fecha FROM partidos WHERE id = $1",
      [idpartido]
    );
    const fechapartido: string = fechaResult.rows[0]?.fecha;

    await client.query(`
      CREATE TEMP TABLE t_detalle (
        idjugador INT,
        nombre VARCHAR(100),
        docnro INT,
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

    await client.query(
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

    await client.query(
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

    await client.query(
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

    await client.query(`
      UPDATE t_detalle d
      SET listanegra = 1
      FROM listanegra l
      WHERE d.idjugador = l.idjugador
        AND l.fhbaja IS NULL
        AND l.codestado = 1
    `);

    await client.query(`
      DELETE FROM t_detalle
      WHERE marca = 0 AND (estadoeq = 0 OR estadojug = 0)
    `);

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

    await client.query("ROLLBACK");
    return result.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const upsertPartidoJugador = async (
  idpartido: number,
  idequipo: number,
  data: PartidoJugadorInput
) => {
  const { idjugador, goles, camiseta, amarilla, azul, roja } = data;

  const client = await pool.connect();
  try {
    const exists = await client.query(
      "SELECT 1 FROM partidos_jugadores WHERE idpartido = $1 AND idjugador = $2",
      [idpartido, idjugador]
    );

    if ((exists?.rowCount ?? 0) > 0) {
      await client.query(
        `
        UPDATE partidos_jugadores
        SET goles = $1, camiseta = $2, amarillas = $3, azules = $4, rojas = $5
        WHERE idpartido = $6 AND idjugador = $7
      `,
        [goles, camiseta, amarilla, azul, roja, idpartido, idjugador]
      );
    } else {
      await client.query(
        `
        INSERT INTO partidos_jugadores
        (idpartido, idequipo, idjugador, goles, camiseta, amarillas, azules, rojas)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [idpartido, idequipo, idjugador, goles, camiseta, amarilla, azul, roja]
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error en upsertPartidoJugador:", error);
    throw error;
  } finally {
    client.release();
  }
};
