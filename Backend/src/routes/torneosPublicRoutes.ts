import express from "express";
import { param } from "express-validator";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validationMiddleware";
import { pool } from "../config/db";

const router = express.Router();

router.get(
  "/:id",
  [
    param("id")
      .isInt()
      .withMessage("El ID del torneo debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const torneoQuery = await pool.query(
      `SELECT t.*, 
              s.nombre AS sede_nombre,
              s.domicilio,
              s.localidad,
              s.provincia,
              s.latitud,
              s.longitud
       FROM wtorneos t
       LEFT JOIN wsedes s ON t.idsede = s.id
       WHERE t.id = $1 AND t.fhbaja IS NULL`,
      [id]
    );

    if (torneoQuery.rowCount === 0) {
      return res.status(404).json({ message: "Torneo no encontrado." });
    }

    const torneo = torneoQuery.rows[0];

    const zonasQuery = await pool.query(
      `SELECT id, nombre, abrev, codcantfechas, codfechaactual
       FROM zonas
       WHERE idtorneo = $1 AND fhbaja IS NULL
       ORDER BY id ASC`,
      [id]
    );
    const zonas = zonasQuery.rows;

    const partidosQuery = await pool.query(
      `SELECT p.*,
              z.nombre AS zona_nombre,
              e1.nombre AS nombre_equipo1,
              e2.nombre AS nombre_equipo2,
              s.nombre AS nombre_sede
       FROM partidos p
       LEFT JOIN zonas z ON p.idzona = z.id
       LEFT JOIN wequipos e1 ON p.idequipo1 = e1.id
       LEFT JOIN wequipos e2 ON p.idequipo2 = e2.id
       LEFT JOIN wsedes s ON p.idsede = s.id
       WHERE z.idtorneo = $1 AND p.fhbaja IS NULL
       ORDER BY p.fecha ASC NULLS LAST`,
      [id]
    );
    const partidos = partidosQuery.rows;

    const sancionesQuery = await pool.query(
      `SELECT s.*, 
              j.nombres AS nombrejugador, 
              e.nombre AS nombreequipo
       FROM sanciones s
       LEFT JOIN jugadores j ON s.idjugador = j.id
       LEFT JOIN wequipos e ON s.idequipo = e.id
       WHERE s.idtorneo = $1 AND s.fhbaja IS NULL
       ORDER BY s.fecha DESC`,
      [id]
    );
    const sanciones = sancionesQuery.rows;

    res.json({
      torneo,
      zonas,
      partidos,
      sanciones,
    });
  })
);

export default router;