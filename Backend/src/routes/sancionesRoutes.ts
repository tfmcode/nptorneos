import express from "express";
import {
  getSancionesController,
  getSancion,
  createSancionController,
  updateSancionController,
  deleteSancionController,
} from "../controllers/sancionesController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { body, param, query } from "express-validator";
import { getTorneosByEquipoID } from "../controllers/torneosController";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("La página debe ser un número entero mayor a 0."),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("El límite debe ser un número entero entre 1 y 100."),
    query("searchTerm")
      .optional()
      .isString()
      .withMessage("El término de búsqueda debe ser una cadena de texto."),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("La fecha de inicio debe tener formato ISO 8601."),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("La fecha de fin debe tener formato ISO 8601."),
  ],
  validateRequest,
  asyncHandler(getSancionesController)
);

router.get(
  "/:id",
  authMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(getSancion)
);

router.get(
  "/torneos/:idequipo",
  authMiddleware,
  [
    param("idequipo")
      .isInt()
      .withMessage("El ID del equipo debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(getTorneosByEquipoID)
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  [
    body("fecha")
      .optional()
      .isISO8601()
      .withMessage("La fecha debe tener formato ISO 8601."),
    body("idjugador")
      .optional()
      .isInt()
      .withMessage("El ID del jugador debe ser un número entero."),
    body("idequipo")
      .optional()
      .isInt()
      .withMessage("El ID del equipo debe ser un número entero."),
    body("idtorneo")
      .optional()
      .isInt()
      .withMessage("El ID del torneo debe ser un número entero."),
    body("titulo")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("El título no puede exceder los 255 caracteres."),
    body("descripcion")
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage("La descripción no puede exceder los 5000 caracteres."),
    body("codestado")
      .optional()
      .isInt()
      .withMessage("El código de estado debe ser un número entero."),
    body("idusuario")
      .isInt()
      .withMessage(
        "El ID de usuario es obligatorio y debe ser un número entero."
      ),
    body("fechafin")
      .optional()
      .isISO8601()
      .withMessage("La fecha de fin debe tener formato ISO 8601."),
  ],
  validateRequest,
  asyncHandler(createSancionController)
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [
    param("id").isInt().withMessage("El ID debe ser un número entero."),
    body("fecha")
      .optional()
      .isISO8601()
      .withMessage("La fecha debe tener formato ISO 8601."),
    body("idjugador")
      .optional()
      .isInt()
      .withMessage("El ID del jugador debe ser un número entero."),
    body("idequipo")
      .optional()
      .isInt()
      .withMessage("El ID del equipo debe ser un número entero."),
    body("idtorneo")
      .optional()
      .isInt()
      .withMessage("El ID del torneo debe ser un número entero."),
    body("titulo")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("El título no puede exceder los 255 caracteres."),
    body("descripcion")
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage("La descripción no puede exceder los 5000 caracteres."),
    body("codestado")
      .optional()
      .isInt()
      .withMessage("El código de estado debe ser un número entero."),
    body("fechafin")
      .optional()
      .isISO8601()
      .withMessage("La fecha de fin debe tener formato ISO 8601."),
  ],
  validateRequest,
  asyncHandler(updateSancionController)
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(deleteSancionController)
);

export default router;
