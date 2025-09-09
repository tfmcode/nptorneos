import express from "express";
import { param, body } from "express-validator";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  getJugadoresPartidoEquipoController,
  upsertPartidoJugadorController,
  deletePartidoJugadorController,
} from "../controllers/partidosJugadoresController";

const router = express.Router();

// GET /api/partidos/:idpartido/equipos/:idequipo/jugadores
router.get(
  "/:idpartido/equipos/:idequipo/jugadores",
  authMiddleware,
  [
    param("idpartido")
      .isInt()
      .withMessage("El ID del partido debe ser un número entero."),
    param("idequipo")
      .isInt()
      .withMessage("El ID del equipo debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(getJugadoresPartidoEquipoController)
);

// POST /api/partidos/:idpartido/equipos/:idequipo/jugadores
router.post(
  "/:idpartido/equipos/:idequipo/jugadores",
  authMiddleware,
  [
    param("idpartido")
      .isInt()
      .withMessage("El ID del partido debe ser un número entero."),
    param("idequipo")
      .isInt()
      .withMessage("El ID del equipo debe ser un número entero."),
    body("idjugador")
      .isInt()
      .withMessage("El ID del jugador es obligatorio y debe ser un número."),
    body("camiseta")
      .optional()
      .isString()
      .isLength({ max: 5 })
      .withMessage("La camiseta debe ser un texto de hasta 5 caracteres."),
    body("goles").optional().isInt(),
    body("amarilla").optional().isInt(),
    body("azul").optional().isInt(),
    body("roja").optional().isInt(),
    body("estado").optional().isInt(),
    body("observaciones").optional().isString().isLength({ max: 255 }),
  ],
  validateRequest,
  asyncHandler(upsertPartidoJugadorController)
);

router.delete(
  "/:idpartido/equipos/:idequipo/jugadores/:idjugador",
  authMiddleware,
  [
    param("idpartido")
      .isInt()
      .withMessage("El ID del partido debe ser un número entero."),
    param("idequipo")
      .isInt()
      .withMessage("El ID del equipo debe ser un número entero."),
    param("idjugador")
      .isInt()
      .withMessage("El ID del jugador debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(deletePartidoJugadorController)
);

export default router;
