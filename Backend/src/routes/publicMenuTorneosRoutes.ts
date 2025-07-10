import express from "express";
import { param } from "express-validator";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validationMiddleware";
import { pool } from "../config/db";

const router = express.Router();

router.get(
  "/:idopcion",
  [
    param("idopcion")
      .isInt()
      .withMessage("El ID de opción debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { idopcion } = req.params;

    const { rows } = await pool.query(
      `SELECT idtorneo, descripcion, orden 
       FROM menutorneos 
       WHERE idopcion = $1 
         AND descripcion IS NOT NULL 
       ORDER BY orden ASC`,
      [idopcion]
    );

    res.json(rows);
  })
);

export default router;
