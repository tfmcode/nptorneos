import { pool } from "../config/db";
import { createEquipo, getEquipoById } from "./equiposModel";
import { IInscripcionJugador } from "./inscripcionesJugadoresModel";
import { getTorneoById } from "./torneosModel";

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

export const procesarEquipo = async (
  inscripcion: IInscripcion,
  jugadores: IInscripcionJugador[]
): Promise<{
  inscripcion: IInscripcion | null;
  jugadores: IInscripcionJugador[];
}> => {
  let sigequipo = 0;
  let sigjugador = 0;
  let nvalor_inscrip = 0;
  let nvalor_fecha = 0;

  try {
    // Update inscription with tournament and zone data
    await pool.query(
      `UPDATE inscripciones SET idtorneo = $1, idzona = $2 WHERE id = $3`,
      [
        inscripcion.idtorneo || null,
        inscripcion.idzona || null,
        inscripcion.id || null,
      ]
    );

    // Use photo from inscription object
    const txfoto = inscripcion.foto || "";

    // Add Team if not associated with any
    if ((inscripcion.idequipoasoc || 0) === 0) {
      // Create new team and get the auto-generated ID
      const { rows: newTeamRows } = await pool.query(
        `INSERT INTO wequipos (nombre, abrev, contacto, emailcto, telefonocto, celularcto, contrasenia, 
         buenafe, codcateg, coddeporte, iniciales, codestado, archivoubic, archivosize, archivonom, 
         idsede, fhcarga, fhbaja, idusuario, foto, observ, saldodeposito)
         VALUES ($1, $2, '', '', '', '', '', 1, 1, 4, '', 1, '', 0, '', 1, NOW(), NULL, 0, $3, '', 0)
         RETURNING id`,
        [inscripcion.equipo || null, inscripcion.equipo || null, txfoto]
      );
      sigequipo = newTeamRows[0].id;
    } else {
      sigequipo = inscripcion.idequipoasoc || 0;

      // Update inscription with associated team
      await pool.query(
        `UPDATE inscripciones SET idequipoasoc = $1 WHERE id = $2`,
        [inscripcion.idequipoasoc || null, inscripcion.id || null]
      );

      // Update team photo if exists
      if (txfoto !== "") {
        await pool.query(`UPDATE wequipos SET foto = $1 WHERE id = $2`, [
          txfoto,
          sigequipo,
        ]);
      }
    }

    // Add team to zone if not already inscribed
    const { rows: existingZoneEquipo } = await pool.query(
      `SELECT * FROM zonas_equipos 
       WHERE idtorneo = $1 AND idzona = $2 AND idequipo = $3 AND fhbaja IS NULL`,
      [inscripcion.idtorneo || null, inscripcion.idzona || null, sigequipo]
    );

    if (existingZoneEquipo.length === 0) {
      // Get tournament values
      const { rows: torneoRows } = await pool.query(
        `SELECT valor_insc, valor_fecha FROM wtorneos WHERE id = $1`,
        [inscripcion.idtorneo || null]
      );

      nvalor_inscrip = torneoRows.length > 0 ? torneoRows[0].valor_insc : 0;
      nvalor_fecha = torneoRows.length > 0 ? torneoRows[0].valor_fecha : 0;

      // Insert into zonas_equipos
      await pool.query(
        `INSERT INTO zonas_equipos (idtorneo, idzona, idequipo, codestado, fhcarga, fhbaja, idusuario, valor_insc, valor_fecha)
         VALUES ($1, $2, $3, 1, NOW(), NULL, 0, $4, $5)`,
        [
          inscripcion.idtorneo || null,
          inscripcion.idzona || null,
          sigequipo,
          nvalor_inscrip,
          nvalor_fecha,
        ]
      );
    }

    // Update existing inscription players data
    for (const jugador of jugadores) {
      await pool.query(
        `UPDATE inscripciones_jug 
         SET apellido = $1, nombres = $2, docnro = $3, fhnacimiento = $4, 
             telefono = $5, email = $6, posicion = $7, facebook = $8
         WHERE idinscrip = $9 AND orden = $10`,
        [
          jugador.apellido,
          jugador.nombres,
          jugador.docnro,
          jugador.fhnacimiento,
          jugador.telefono,
          jugador.email,
          jugador.posicion,
          jugador.facebook,
          inscripcion.id || null,
          jugador.orden,
        ]
      );
    }

    // Process each player
    for (const jugador of jugadores) {
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

      // Add player if doesn't exist
      const { rows: existingPlayerRows } = await pool.query(
        `SELECT id FROM jugadores WHERE docnro = $1 AND fhbaja IS NULL`,
        [docnro]
      );

      if (existingPlayerRows.length === 0) {
        // Create new player and get auto-generated ID
        const { rows: newPlayerRows } = await pool.query(
          `INSERT INTO jugadores (nombres, apellido, fhnacimiento, docnro, telefono, email, facebook,
           twitter, peso, altura, apodo, posicion, categoria, piernahabil, codestado, fhcarga, fhbaja, fhultmod, usrultmod, foto)
           VALUES ($1, $2, $3, $4, $5, $6, $7, '', '', '', '', '', '', '', 1, NOW(), NULL, NOW(), 0, '')
           RETURNING id`,
          [nombres, apellido, fhnacimiento, docnro, telefono, email, facebook]
        );
        sigjugador = newPlayerRows[0].id;
      } else {
        sigjugador = existingPlayerRows[0].id;
      }

      // Update team contact info if captain
      if (capitan === 1) {
        await pool.query(
          `UPDATE wequipos 
           SET contacto = UPPER(CONCAT($1::text, ' ', $2::text)), emailcto = $3::text, telefonocto = $4::text
           WHERE id = $5::integer`,
          [
            String(nombres || ""),
            String(apellido || ""),
            String(inscripcion.email || ""),
            String(telefono || ""),
            Number(sigequipo || 0),
          ]
        );
      }

      // Update team mobile if sub-captain
      if (subcapitan === 1) {
        await pool.query(`UPDATE wequipos SET celularcto = $1 WHERE id = $2`, [
          telefono,
          sigequipo,
        ]);
      }

      // Add team/player relationship if doesn't exist
      const { rows: existingTeamPlayerRows } = await pool.query(
        `SELECT * FROM wequipos_jugadores 
         WHERE idequipo = $1 AND idjugador = $2 AND fhbaja IS NULL`,
        [sigequipo, sigjugador]
      );

      if (existingTeamPlayerRows.length === 0) {
        // Create team-player relationship with auto-generated ID
        await pool.query(
          `INSERT INTO wequipos_jugadores (idjugador, idequipo, camiseta, capitan, subcapitan, codtipo, codestado, fhcarga, fhbaja, idusuario)
           VALUES ($1, $2, $3, $4, $5, 1, 1, NOW(), NULL, 0)`,
          [sigjugador, sigequipo, posicion || null, capitan, subcapitan]
        );
      }
    }

    // Mark inscription as processed
    await pool.query(`UPDATE inscripciones SET codestado = 1 WHERE id = $1`, [
      inscripcion.id || null,
    ]);

    // Get final inscription data
    const inscripcionResult = await getInscripcionById(inscripcion.id || 0);

    return {
      inscripcion: inscripcionResult,
      jugadores,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    throw new Error(errorMessage);
  }
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

  // Exclude computed fields that are not actual database columns
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
