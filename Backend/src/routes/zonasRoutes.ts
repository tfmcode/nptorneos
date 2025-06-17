import express from "express";
import {
  createZonaController,
  getZonasByTorneo,
  getZona,
  updateZonaController,
  deleteZonaController,
} from "../controllers/zonasController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { body, param } from "express-validator";

const router = express.Router();

router.get(
  "/torneo/:idTorneo",
  authMiddleware,
  [
    param("idTorneo")
      .isInt()
      .withMessage("El ID del torneo debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(getZonasByTorneo)
);

router.get(
  "/:id",
  authMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(getZona)
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  [
    body("idtorneo")
      .optional()
      .isInt()
      .withMessage("El ID del torneo debe ser un número entero."),
    body("nombre")
      .trim()
      .notEmpty()
      .withMessage("El nombre es obligatorio.")
      .isLength({ max: 255 })
      .withMessage("El nombre no puede exceder los 255 caracteres."),
    body("abrev")
      .trim()
      .notEmpty()
      .withMessage("La abreviatura es obligatoria.")
      .isLength({ max: 150 })
      .withMessage("La abreviatura no puede exceder los 150 caracteres."),
    body("codcantfechas")
      .optional()
      .isInt()
      .withMessage(
        "El código de cantidad de fechas debe ser un número entero."
      ),
    body("codfechaactual")
      .optional()
      .isInt()
      .withMessage("El código de fecha actual debe ser un número entero."),
    body("codestado")
      .optional()
      .isInt()
      .withMessage("El código de estado debe ser un número entero."),
    body("idusuario")
      .isInt()
      .withMessage(
        "El ID de usuario es obligatorio y debe ser un número entero."
      ),
    body("amistoso")
      .optional()
      .isInt({ min: 0, max: 1 })
      .withMessage("El campo amistoso debe ser 0 o 1."),
  ],
  validateRequest,
  asyncHandler(createZonaController)
);

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
    body("nombre")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El nombre no puede estar vacío.")
      .isLength({ max: 255 })
      .withMessage("El nombre no puede exceder los 255 caracteres."),
    body("abrev")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("La abreviatura no puede estar vacía.")
      .isLength({ max: 150 })
      .withMessage("La abreviatura no puede exceder los 150 caracteres."),
    body("codcantfechas")
      .optional()
      .isInt()
      .withMessage(
        "El código de cantidad de fechas debe ser un número entero."
      ),
    body("codfechaactual")
      .optional()
      .isInt()
      .withMessage("El código de fecha actual debe ser un número entero."),
    body("codestado")
      .optional()
      .isInt()
      .withMessage("El código de estado debe ser un número entero."),
    body("amistoso")
      .optional()
      .isInt({ min: 0, max: 1 })
      .withMessage("El campo amistoso debe ser 0 o 1."),
  ],
  validateRequest,
  asyncHandler(updateZonaController)
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(deleteZonaController)
);

export default router;
