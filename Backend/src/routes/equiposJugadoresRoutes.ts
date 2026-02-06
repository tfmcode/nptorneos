import express from "express";
import { body, param } from "express-validator";
import {
  getJugadoresByEquipoController,
  getEquipoJugadorController,
  createEquipoJugadorController,
  updateEquipoJugadorController,
  deleteEquipoJugadorController,
} from "../controllers/equiposJugadoresController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { adminOrStaffMiddleware } from "../middlewares/adminOrStaffMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validationMiddleware";

const router = express.Router();

// Obtener todos los jugadores de un equipo
router.get(
  "/equipo/:idequipo",
  authMiddleware,
  [
    param("idequipo")
      .isInt()
      .withMessage("El ID de equipo debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(getJugadoresByEquipoController)
);

// Obtener un jugador de equipo por ID
router.get(
  "/:id",
  authMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(getEquipoJugadorController)
);

// Crear jugador en el equipo
router.post(
  "/",
  authMiddleware,
  adminOrStaffMiddleware,
  [
    body("idjugador")
      .isInt()
      .withMessage(
        "El ID de jugador es obligatorio y debe ser un número entero."
      ),
    body("idequipo")
      .isInt()
      .withMessage(
        "El ID de equipo es obligatorio y debe ser un número entero."
      ),
    body("camiseta")
      .optional()
      .isInt()
      .withMessage("El número de camiseta debe ser un número entero."),
    body("capitan")
      .optional()
      .isBoolean()
      .withMessage("Capitan debe ser un valor booleano."),
    body("subcapitan")
      .optional()
      .isBoolean()
      .withMessage("Subcapitan debe ser un valor booleano."),
    body("codtipo")
      .optional()
      .isInt()
      .withMessage("El código de tipo debe ser un número entero."),
    body("codestado")
      .optional()
      .isInt()
      .withMessage("El código de estado debe ser un número entero."),
    body("idusuario")
      .isInt()
      .withMessage(
        "El ID de usuario es obligatorio y debe ser un número entero."
      ),
  ],
  validateRequest,
  asyncHandler(createEquipoJugadorController)
);

// Actualizar jugador del equipo
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [
    param("id").isInt().withMessage("El ID debe ser un número entero."),
    body("idjugador")
      .optional()
      .isInt()
      .withMessage("El ID de jugador debe ser un número entero."),
    body("idequipo")
      .optional()
      .isInt()
      .withMessage("El ID de equipo debe ser un número entero."),
    body("camiseta")
      .optional()
      .isInt()
      .withMessage("El número de camiseta debe ser un número entero."),
    body("capitan")
      .optional()
      .isBoolean()
      .withMessage("Capitan debe ser un valor booleano."),
    body("subcapitan")
      .optional()
      .isBoolean()
      .withMessage("Subcapitan debe ser un valor booleano."),
    body("codtipo")
      .optional()
      .isInt()
      .withMessage("El código de tipo debe ser un número entero."),
    body("codestado")
      .optional()
      .isInt()
      .withMessage("El código de estado debe ser un número entero."),
    body("idusuario")
      .optional()
      .isInt()
      .withMessage("El ID de usuario debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(updateEquipoJugadorController)
);

// Eliminar jugador del equipo (soft delete)
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(deleteEquipoJugadorController)
);

export default router;
