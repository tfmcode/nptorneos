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

// ✅ AGREGAR ESTE ENDPOINT en publicTorneosRoutes.ts

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

    const zonasQuery = await pool.query(
      `SELECT id, nombre FROM zonas WHERE idtorneo = $1 AND fhbaja IS NULL`,
      [id]
    );
    const zonas = zonasQuery.rows;

    const posiciones: any[] = [];

    for (const zona of zonas) {
      const result = await pool.query(
        `SELECT * FROM calcular_posiciones_por_zona($1)`,
        [zona.id]
      );

      const posicionesZona = result.rows.map((row: any) => ({
        zona_id: zona.id,
        zona_nombre: zona.nombre,
        equipo_id: row.idequipo,
        equipo_nombre: row.equipo,
        jugados: row.pj,
        ganados: row.pg,
        empatados: row.pe,
        perdidos: row.pp,
        gf: row.gf,
        gc: row.gc,
        dg: row.dif,
        pb: row.pb,
        puntos: row.pts,
      }));

      posiciones.push(...posicionesZona);
    }

    res.json(posiciones);
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
