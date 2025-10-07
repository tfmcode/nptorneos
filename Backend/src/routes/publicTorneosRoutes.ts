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

    const { rows } = await pool.query(`SELECT get_torneo_publico($1) AS data`, [
      id,
    ]);

    const result = rows[0]?.data;

    if (!result || !result.torneo) {
      return res.status(404).json({ message: "Torneo no encontrado." });
    }

    res.json(result);
  })
);

router.get(
  "/:id/sanciones",
  [
    param("id")
      .isInt()
      .withMessage("El ID del torneo debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT 
        s.id, 
        TO_CHAR(s.fecha, 'DD/MM/YYYY') as fecha,
        s.titulo, 
        s.descripcion, 
        TO_CHAR(s.fechafin, 'DD/MM/YYYY') as fechafin,
        CONCAT(j.apellido, ' ', j.nombres) as jugador,
        e.nombre as equipo
      FROM sanciones s
      INNER JOIN jugadores j ON s.idjugador = j.id
      INNER JOIN wequipos e ON s.idequipo = e.id
      WHERE s.idtorneo = $1 
        AND s.fhbaja IS NULL 
        AND s.codestado = 1
      ORDER BY s.fecha DESC`,
      [id]
    );

    res.json(rows);
  })
);

router.get(
  "/partido/:id/ficha",
  [
    param("id")
      .isInt()
      .withMessage("El ID del partido debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { rows } = await pool.query(`SELECT get_ficha_partido($1) AS data`, [
      Number(id),
    ]);

    const data = rows[0]?.data;

    if (!data) {
      return res.status(404).json({ message: "Ficha no encontrada" });
    }

    res.json(data);
  })
);

// ✅ ENDPOINT CORREGIDO - Usa la nueva función que filtra zonas amistosas
router.get(
  "/:id/posiciones",
  [
    param("id")
      .isInt()
      .withMessage("El ID del torneo debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // ✅ Usar la nueva función que ya filtra zonas amistosas
    const { rows } = await pool.query(
      `SELECT * FROM get_posiciones_por_torneo($1)`,
      [id]
    );

    res.json(rows);
  })
);

router.get(
  "/zonas/:id/goleadores",
  [
    param("id")
      .isInt()
      .withMessage("El ID de la zona debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const zonaId = Number(req.params.id);

    const { rows } = await pool.query(
      `SELECT * FROM get_goleadores_por_zona($1)`,
      [zonaId]
    );

    res.json(rows);
  })
);

router.get(
  "/zonas/:idzona/sanciones",
  [
    param("idzona")
      .isInt()
      .withMessage("El ID de zona debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const idzona = Number(req.params.idzona);

    const query = `
      SELECT * FROM get_sanciones_por_zona($1)
    `;

    const { rows } = await pool.query(query, [idzona]);

    res.json(rows);
  })
);

export default router;
