import { pool } from "../config/db";
import { IInscripcionJugador } from "./inscripcionesJugadoresModel";

export interface IInscripcion {
  id?: number;
  email?: string;
  equipo?: string;
  idtorneo?: number;
  codestado?: number;
  fhcarga?: Date;
  fhbaja?: Date | null;
  idzona?: number;
  idequipoasoc?: number;
  foto?: string;
  torneo?: string;
}

export const getAllInscripciones = async (
  page: number,
  limit: number,
  searchTerm: string
): Promise<{ inscripciones: IInscripcion[]; total: number }> => {
  const offset = (page - 1) * limit;

  let totalQuery: string;
  let inscripcionesQuery: string;
  let params: any[];

  if (searchTerm) {
    totalQuery = `SELECT COUNT(*) FROM inscripciones i
      LEFT JOIN wtorneos t ON i.idtorneo = t.id
      WHERE i.fhbaja IS NULL AND (LOWER(i.equipo) LIKE LOWER($1) OR LOWER(t.nombre) LIKE LOWER($1));`;
    inscripcionesQuery = `
      SELECT i.*, t.nombre as torneo FROM inscripciones i
      LEFT JOIN wtorneos t ON i.idtorneo = t.id
      WHERE i.fhbaja IS NULL AND (LOWER(i.equipo) LIKE LOWER($1) OR LOWER(t.nombre) LIKE LOWER($1))
      ORDER BY i.id DESC 
      LIMIT $2 OFFSET $3;`;
    params = [`%${searchTerm}%`, limit, offset];
  } else {
    totalQuery = `SELECT COUNT(*) FROM inscripciones i WHERE i.fhbaja IS NULL;`;
    inscripcionesQuery = `
      SELECT i.*, t.nombre as torneo FROM inscripciones i
      LEFT JOIN wtorneos t ON i.idtorneo = t.id
      WHERE i.fhbaja IS NULL
      ORDER BY i.id DESC 
      LIMIT $1 OFFSET $2;`;
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

export const getInscripcionById = async (
  id: number
): Promise<IInscripcion | null> => {
  const { rows } = await pool.query(
    `SELECT i.*, t.nombre as torneo FROM inscripciones i
    LEFT JOIN wtorneos t ON i.idtorneo = t.id
    WHERE i.id = $1 AND i.fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const createInscripcion = async (
  inscripcion: IInscripcion
): Promise<IInscripcion> => {
  const { rows } = await pool.query(
    `INSERT INTO inscripciones (email, equipo, idtorneo, codestado, idzona, idequipoasoc, foto) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *;`,
    [
      inscripcion.email,
      inscripcion.equipo,
      inscripcion.idtorneo,
      inscripcion.codestado,
      inscripcion.idzona,
      inscripcion.idequipoasoc,
      inscripcion.foto,
    ]
  );
  return rows[0];
};

export const updateEquipoAsoc = async (
  id: number,
  idequipoasoc: number
): Promise<IInscripcion | null> => {
  const { rows } = await pool.query(
    `UPDATE inscripciones SET idequipoasoc = $1 WHERE id = $2 RETURNING *;`,
    [idequipoasoc, id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const updateInscripcion = async (
  id: number,
  inscripcion: Partial<IInscripcion>
): Promise<IInscripcion | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  const excludedFields = ["torneo"];

  for (const key in inscripcion) {
    if (
      inscripcion[key as keyof IInscripcion] !== undefined &&
      !excludedFields.includes(key)
    ) {
      updates.push(`${key} = $${index}`);
      values.push(inscripcion[key as keyof IInscripcion]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(id);
  const query = `UPDATE inscripciones SET ${updates.join(
    ", "
  )} WHERE id = $${index} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deleteInscripcion = async (id: number): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE inscripciones SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;",
      [id]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error al eliminar inscripción:", error);
    throw new Error("Error al eliminar la inscripción.");
  }
};

const procesarJugadorPorDNI = async (
  client: any,
  jugador: IInscripcionJugador,
  sigequipo: number
): Promise<number> => {
  const {
    apellido,
    nombres,
    docnro,
    fhnacimiento,
    telefono,
    email,
    posicion,
    facebook,
    capitan,
    subcapitan,
  } = jugador;

  const { rows: jugadorExistente } = await client.query(
    `SELECT id, fhbaja FROM jugadores WHERE docnro = $1`,
    [docnro]
  );

  let idjugador: number;

  if (jugadorExistente.length > 0) {
    idjugador = jugadorExistente[0].id;
    const estaEliminado = jugadorExistente[0].fhbaja !== null;

    if (estaEliminado) {
      await client.query(
        `UPDATE jugadores
         SET telefono = COALESCE(NULLIF($1, ''), telefono),
             email = COALESCE(NULLIF($2, ''), email),
             facebook = COALESCE(NULLIF($3, ''), facebook),
             fhbaja = NULL,
             codestado = 1,
             fhultmod = NOW()
         WHERE id = $4`,
        [telefono, email, facebook, idjugador]
      );
    } else {
      await client.query(
        `UPDATE jugadores
         SET telefono = COALESCE(NULLIF($1, ''), telefono),
             email = COALESCE(NULLIF($2, ''), email),
             facebook = COALESCE(NULLIF($3, ''), facebook),
             fhultmod = NOW()
         WHERE id = $4`,
        [telefono, email, facebook, idjugador]
      );
    }
  } else {
    const { rows: nuevoJugador } = await client.query(
      `INSERT INTO jugadores (
        nombres, apellido, docnro, fhnacimiento, telefono, 
        email, facebook, posicion, codestado, fhcarga, fhultmod
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, NOW(), NOW())
      RETURNING id`,
      [
        nombres,
        apellido,
        docnro,
        fhnacimiento,
        telefono,
        email,
        facebook,
        posicion,
      ]
    );

    idjugador = nuevoJugador[0].id;
  }

  if (capitan === 1) {
    await client.query(
      `UPDATE wequipos 
       SET contacto = UPPER(CONCAT($1::text, ' ', $2::text)), 
           emailcto = $3, 
           telefonocto = $4
       WHERE id = $5`,
      [nombres, apellido, email, telefono, sigequipo]
    );
  }

  if (subcapitan === 1) {
    await client.query(`UPDATE wequipos SET celularcto = $1 WHERE id = $2`, [
      telefono,
      sigequipo,
    ]);
  }

  const { rows: relacionExistente } = await client.query(
    `SELECT id FROM wequipos_jugadores 
     WHERE idequipo = $1 AND idjugador = $2 AND fhbaja IS NULL`,
    [sigequipo, idjugador]
  );

  if (relacionExistente.length === 0) {
    const camiseta = posicion && !isNaN(Number(posicion)) ? Number(posicion) : null;

    await client.query(
      `INSERT INTO wequipos_jugadores (
        idjugador, idequipo, camiseta, capitan, subcapitan,
        codtipo, codestado, fhcarga, idusuario
      )
      VALUES ($1, $2, $3, $4, $5, 1, 1, NOW(), 0)`,
      [idjugador, sigequipo, camiseta, capitan, subcapitan]
    );
  }

  return idjugador;
};

export const procesarEquipo = async (
  inscripcion: IInscripcion,
  jugadores: IInscripcionJugador[]
): Promise<{
  inscripcion: IInscripcion | null;
  jugadores: IInscripcionJugador[];
}> => {
  if (!inscripcion.id) {
    throw new Error("ID de inscripción requerido para procesar el equipo.");
  }

  const inscripcionId = inscripcion.id;

  if (!jugadores || jugadores.length === 0) {
    throw new Error("Se requiere al menos un jugador para procesar el equipo.");
  }

  const { rows: inscripcionExistente } = await pool.query(
    `SELECT id, codestado FROM inscripciones WHERE id = $1 AND fhbaja IS NULL`,
    [inscripcionId]
  );

  if (inscripcionExistente.length === 0) {
    throw new Error("La inscripción no existe o fue eliminada.");
  }

  if (inscripcionExistente[0].codestado === 1) {
    throw new Error("Esta inscripción ya fue procesada anteriormente.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE inscripciones SET idtorneo = $1, idzona = $2 WHERE id = $3`,
      [inscripcion.idtorneo || null, inscripcion.idzona || null, inscripcionId]
    );

    const txfoto = inscripcion.foto || "";
    let sigequipo = 0;

    if (!inscripcion.idequipoasoc || inscripcion.idequipoasoc === 0) {
      const { rows: newTeamRows } = await client.query(
        `INSERT INTO wequipos (
          nombre, abrev, contacto, emailcto, telefonocto, celularcto, 
          contrasenia, buenafe, codcateg, coddeporte, iniciales, 
          codestado, archivoubic, archivosize, archivonom, idsede, 
          fhcarga, idusuario, foto, observ, saldodeposito
        )
        VALUES ($1, $2, '', '', '', '', '', 1, 1, 4, '', 1, '', 0, '', 1, NOW(), 0, $3, '', 0)
        RETURNING id`,
        [inscripcion.equipo || null, inscripcion.equipo || null, txfoto]
      );
      sigequipo = newTeamRows[0].id;
    } else {
      sigequipo = inscripcion.idequipoasoc;

      await client.query(
        `UPDATE inscripciones SET idequipoasoc = $1 WHERE id = $2`,
        [inscripcion.idequipoasoc, inscripcionId]
      );

      if (txfoto !== "") {
        await client.query(`UPDATE wequipos SET foto = $1 WHERE id = $2`, [
          txfoto,
          sigequipo,
        ]);
      }
    }

    const { rows: existingZoneEquipo } = await client.query(
      `SELECT id FROM zonas_equipos 
       WHERE idtorneo = $1 AND idzona = $2 AND idequipo = $3 AND fhbaja IS NULL`,
      [inscripcion.idtorneo || null, inscripcion.idzona || null, sigequipo]
    );

    if (existingZoneEquipo.length === 0) {
      const { rows: torneoRows } = await client.query(
        `SELECT valor_insc, valor_fecha FROM wtorneos WHERE id = $1`,
        [inscripcion.idtorneo || null]
      );

      const nvalor_inscrip =
        torneoRows.length > 0 ? torneoRows[0].valor_insc : 0;
      const nvalor_fecha =
        torneoRows.length > 0 ? torneoRows[0].valor_fecha : 0;

      await client.query(
        `INSERT INTO zonas_equipos (
          idtorneo, idzona, idequipo, codestado, fhcarga, idusuario, valor_insc, valor_fecha
        )
        VALUES ($1, $2, $3, 1, NOW(), 0, $4, $5)`,
        [
          inscripcion.idtorneo || null,
          inscripcion.idzona || null,
          sigequipo,
          nvalor_inscrip,
          nvalor_fecha,
        ]
      );
    }

    for (const jugador of jugadores) {
      await procesarJugadorPorDNI(client, jugador, sigequipo);
    }

    const { rows: inscripcionActualizada } = await client.query(
      `UPDATE inscripciones SET codestado = 1 WHERE id = $1 RETURNING *`,
      [inscripcionId]
    );

    if (
      inscripcionActualizada.length === 0 ||
      inscripcionActualizada[0].codestado !== 1
    ) {
      throw new Error(
        "No se pudo actualizar el estado de la inscripción a 'procesado'."
      );
    }

    await client.query("COMMIT");

    const inscripcionFinal = await getInscripcionById(inscripcionId);

    const { rows: jugadoresFinales } = await pool.query(
      `SELECT ij.*,
        CASE WHEN j.id IS NOT NULL THEN TRUE ELSE FALSE END AS jugadorexistente,
        CASE WHEN s.id IS NOT NULL AND s.fechafin > NOW() THEN TRUE ELSE FALSE END AS sancion,
        CASE WHEN ln.id IS NOT NULL THEN TRUE ELSE FALSE END AS listanegra
       FROM inscripciones_jug ij
       LEFT JOIN jugadores j ON ij.docnro = j.docnro AND j.fhbaja IS NULL
       LEFT JOIN sanciones s ON j.id = s.idjugador AND s.fhbaja IS NULL
       LEFT JOIN listanegra ln ON j.id = ln.idjugador AND ln.fhbaja IS NULL
       WHERE ij.idinscrip = $1 AND ij.fhbaja IS NULL
       ORDER BY ij.orden ASC`,
      [inscripcionId]
    );

    return {
      inscripcion: inscripcionFinal,
      jugadores: jugadoresFinales,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
