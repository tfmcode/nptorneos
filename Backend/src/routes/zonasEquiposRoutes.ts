import express from "express";
import {
  createZonaEquipoController,
  getZonasEquiposByTorneoController,
  getZonaEquipoController,
  updateZonaEquipoController,
  deleteZonaEquipoController,
} from "../controllers/zonasEquiposController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { body, param } from "express-validator";

const router = express.Router();

// Get all equipos de zona by torneo
router.get(
  "/torneo/:idTorneo",
  authMiddleware,
  [
    param("idTorneo")
      .isInt()
      .withMessage("El ID del torneo debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(getZonasEquiposByTorneoController)
);

// Get single equipo de zona by id
router.get(
  "/:id",
  authMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(getZonaEquipoController)
);

// Create equipo de zona
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  [
    body("idtorneo")
      .isInt()
      .withMessage(
        "El ID del torneo es obligatorio y debe ser un número entero."
      ),
    body("idzona")
      .isInt()
      .withMessage("El ID de zona es obligatorio y debe ser un número entero."),
    body("idequipo")
      .isInt()
      .withMessage(
        "El ID de equipo es obligatorio y debe ser un número entero."
      ),
    body("codestado")
      .isInt()
      .withMessage(
        "El código de estado es obligatorio y debe ser un número entero."
      ),
    body("idusuario")
      .isInt()
      .withMessage(
        "El ID de usuario es obligatorio y debe ser un número entero."
      ),
    body("valor_insc")
      .optional()
      .isNumeric()
      .withMessage("El valor de inscripción debe ser numérico."),
    body("valor_fecha")
      .optional()
      .isNumeric()
      .withMessage("El valor de fecha debe ser numérico."),
  ],
  validateRequest,
  asyncHandler(createZonaEquipoController)
);

// Update equipo de zona
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [
    param("id").isInt().withMessage("El ID debe ser un número entero."),
    body("idtorneo")
      .optional()
      .isInt()
      .withMessage("El ID del torneo debe ser un número entero."),
    body("idzona")
      .optional()
      .isInt()
      .withMessage("El ID de zona debe ser un número entero."),
    body("idequipo")
      .optional()
      .isInt()
      .withMessage("El ID de equipo debe ser un número entero."),
    body("codestado")
      .optional()
      .isInt()
      .withMessage("El código de estado debe ser un número entero."),
    body("idusuario")
      .optional()
      .isInt()
      .withMessage("El ID de usuario debe ser un número entero."),
    body("valor_insc")
      .optional()
      .isNumeric()
      .withMessage("El valor de inscripción debe ser numérico."),
    body("valor_fecha")
      .optional()
      .isNumeric()
      .withMessage("El valor de fecha debe ser numérico."),
  ],
  validateRequest,
  asyncHandler(updateZonaEquipoController)
);

// Delete equipo de zona
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(deleteZonaEquipoController)
);

export default router;
