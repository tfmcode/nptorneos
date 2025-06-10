import express from "express";
import {
  createTorneoImagenController,
  getTorneoImagenesByTorneoController,
  getTorneoImagenController,
  updateTorneoImagenController,
  deleteTorneoImagenController,
} from "../controllers/torneosImagenesController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { body, param } from "express-validator";

const router = express.Router();

// Get all images by torneo
router.get(
  "/torneo/:idTorneo",
  authMiddleware,
  [
    param("idTorneo")
      .isInt()
      .withMessage("El ID del torneo debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(getTorneoImagenesByTorneoController)
);

// Get single image by id
router.get(
  "/:id",
  authMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(getTorneoImagenController)
);

// Create image
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  [
    body("idtorneo")
      .optional()
      .isInt()
      .withMessage("El ID del torneo debe ser un número entero."),
    body("idzona")
      .optional()
      .isInt()
      .withMessage("El ID de zona debe ser un número entero."),
    body("idimagen")
      .optional()
      .isInt()
      .withMessage("El ID de imagen debe ser un número entero."),
    body("descripcion")
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage("La descripción no puede exceder los 100 caracteres."),
    body("nombre")
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage("El nombre no puede exceder los 100 caracteres."),
    body("ubicacion")
      .optional()
      .isString()
      .isLength({ max: 200 })
      .withMessage("La ubicación no puede exceder los 200 caracteres."),
    body("home")
      .optional()
      .isInt()
      .withMessage("El campo home debe ser un número entero."),
    body("orden")
      .optional()
      .isInt()
      .withMessage("El campo orden debe ser un número entero."),
    body("usrultmod")
      .optional()
      .isInt()
      .withMessage(
        "El usuario de última modificación debe ser un número entero."
      ),
    body("fhultmod")
      .optional()
      .isISO8601()
      .withMessage(
        "La fecha de última modificación debe ser una fecha válida."
      ),
  ],
  validateRequest,
  asyncHandler(createTorneoImagenController)
);

// Update image
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
    body("idimagen")
      .optional()
      .isInt()
      .withMessage("El ID de imagen debe ser un número entero."),
    body("descripcion")
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage("La descripción no puede exceder los 100 caracteres."),
    body("nombre")
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage("El nombre no puede exceder los 100 caracteres."),
    body("ubicacion")
      .optional()
      .isString()
      .isLength({ max: 200 })
      .withMessage("La ubicación no puede exceder los 200 caracteres."),
    body("home")
      .optional()
      .isInt()
      .withMessage("El campo home debe ser un número entero."),
    body("orden")
      .optional()
      .isInt()
      .withMessage("El campo orden debe ser un número entero."),
    body("usrultmod")
      .optional()
      .isInt()
      .withMessage(
        "El usuario de última modificación debe ser un número entero."
      ),
    body("fhultmod")
      .optional()
      .isISO8601()
      .withMessage(
        "La fecha de última modificación debe ser una fecha válida."
      ),
  ],
  validateRequest,
  asyncHandler(updateTorneoImagenController)
);

// Delete image
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(deleteTorneoImagenController)
);

export default router;
