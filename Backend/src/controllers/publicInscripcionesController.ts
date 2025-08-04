import { Request, Response } from "express";
import { pool } from "../config/db";

export const createInscripcionPublicController = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const { email, equipo, idtorneo, jugadores, foto } = req.body;

    if (!email || !equipo || !idtorneo || !Array.isArray(jugadores)) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    // Validar duplicado: mismo email + equipo + torneo en el día
    const { rows: duplicados } = await client.query(
      `SELECT id FROM inscripciones 
       WHERE email = $1 AND equipo = $2 AND idtorneo = $3 
         AND DATE(fhcarga) = CURRENT_DATE AND fhbaja IS NULL`,
      [email, equipo, idtorneo]
    );
    if (duplicados.length > 0) {
      return res
        .status(400)
        .json({ error: "Ya existe una inscripción con estos datos hoy." });
    }

    // Obtener cantmin desde torneo válido
    const { rows: torneoRows } = await client.query(
      `SELECT cantmin FROM wtorneos 
       WHERE id = $1 AND fhbaja IS NULL AND codtipoestado = 3`,
      [idtorneo]
    );
    if (torneoRows.length === 0) {
      return res.status(400).json({ error: "Torneo no válido o inactivo." });
    }

    const cantmin = torneoRows[0].cantmin;
    let cantmax = 0;
    if ([5, 6].includes(cantmin)) cantmax = 10;
    else if ([8, 9].includes(cantmin)) cantmax = 16;
    else if (cantmin === 11) cantmax = 22;

    if (jugadores.length < cantmin)
      return res
        .status(400)
        .json({ error: `Debe ingresar al menos ${cantmin} jugadores.` });

    if (jugadores.length > cantmax)
      return res
        .status(400)
        .json({ error: `Debe ingresar como máximo ${cantmax} jugadores.` });

    // Insertar inscripción
    await client.query("BEGIN");

    const { rows: inscRows } = await client.query(
      `INSERT INTO inscripciones (email, equipo, idtorneo, foto) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [email, equipo, idtorneo, foto || ""]
    );
    const idinscrip = inscRows[0].id;

    // Insertar jugadores
    for (const [i, j] of jugadores.entries()) {
      await client.query(
        `INSERT INTO inscripciones_jug (
          idinscrip, orden, apellido, nombres, docnro, fhnacimiento,
          telefono, email, posicion, facebook, capitan, subcapitan
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          idinscrip,
          i + 1,
          j.apellido,
          j.nombres,
          j.docnro,
          j.fhnacimiento,
          j.telefono,
          j.email || null,
          j.posicion || null,
          j.facebook || null,
          j.capitan || 0,
          j.subcapitan || 0,
        ]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Inscripción realizada exitosamente.",
      id: idinscrip,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error en inscripción pública:", error);
    return res.status(500).json({ error: "Error al procesar la inscripción." });
  } finally {
    client.release();
  }
};
