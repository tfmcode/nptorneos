import express from "express";
import {
  getTorneosEquiposInscController,
  getTorneosEquiposInscByIdController,
  getTorneosEquiposInscByTorneoController,
  getTorneosEquiposInscByEquipoController,
  createTorneosEquiposInscController,
  updateTorneosEquiposInscController,
  deleteTorneosEquiposInscController,
} from "../controllers/torneosEquiposInscController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validationMiddleware";
import { body, param } from "express-validator";

const router = express.Router();

// Obtener todas las inscripciones con paginación y búsqueda
router.get("/", authMiddleware, asyncHandler(getTorneosEquiposInscController));

// Obtener inscripción por ID
router.get(
  "/:id",
  authMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(getTorneosEquiposInscByIdController)
);

// Obtener inscripciones por torneo
router.get(
  "/torneo/:idtorneo",
  authMiddleware,
  [
    param("idtorneo")
      .isInt()
      .withMessage("El ID del torneo debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(getTorneosEquiposInscByTorneoController)
);

// Obtener inscripciones por equipo
router.get(
  "/equipo/:idequipo",
  authMiddleware,
  [
    param("idequipo")
      .isInt()
      .withMessage("El ID del equipo debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(getTorneosEquiposInscByEquipoController)
);

// Crear nueva inscripción
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

    body("idequipo")
      .isInt()
      .withMessage(
        "El ID del equipo es obligatorio y debe ser un número entero."
      ),

    body("inscrip")
      .optional()
      .isNumeric()
      .withMessage("La inscripción debe ser un número válido."),

    body("deposito")
      .optional()
      .isNumeric()
      .withMessage("El depósito debe ser un número válido."),

    body("ivainscrip")
      .optional()
      .isNumeric()
      .withMessage("El IVA de inscripción debe ser un número válido."),

    body("ivadeposito")
      .optional()
      .isNumeric()
      .withMessage("El IVA de depósito debe ser un número válido."),

    body("idpartido")
      .optional()
      .isInt()
      .withMessage("El ID del partido debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(createTorneosEquiposInscController)
);

// Actualizar inscripción
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

    body("idequipo")
      .optional()
      .isInt()
      .withMessage("El ID del equipo debe ser un número entero."),

    body("inscrip")
      .optional()
      .isNumeric()
      .withMessage("La inscripción debe ser un número válido."),

    body("deposito")
      .optional()
      .isNumeric()
      .withMessage("El depósito debe ser un número válido."),

    body("ivainscrip")
      .optional()
      .isNumeric()
      .withMessage("El IVA de inscripción debe ser un número válido."),

    body("ivadeposito")
      .optional()
      .isNumeric()
      .withMessage("El IVA de depósito debe ser un número válido."),

    body("idpartido")
      .optional()
      .isInt()
      .withMessage("El ID del partido debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(updateTorneosEquiposInscController)
);

// Eliminar inscripción
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(deleteTorneosEquiposInscController)
);

export default router;
