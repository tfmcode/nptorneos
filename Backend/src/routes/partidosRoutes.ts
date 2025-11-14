import express from "express";
import {
  createPartidoController,
  getPartidosByZonaController,
  getPartidoController,
  updatePartidoController,
  deletePartidoController,
} from "../controllers/partidosController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { adminOrStaffMiddleware } from "../middlewares/adminOrStaffMiddleware"; // ✅ NUEVO
import { validateRequest } from "../middlewares/validationMiddleware";
import { body, param } from "express-validator";

const router = express.Router();

// ✅ GET - Staff puede ver partidos
router.get(
  "/zona/:idZona",
  authMiddleware,
  adminOrStaffMiddleware, // ✅ CAMBIADO: de sin middleware adicional a adminOrStaffMiddleware
  [
    param("idZona")
      .isInt()
      .withMessage("El ID de la zona debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(getPartidosByZonaController)
);

// ✅ GET - Staff puede ver un partido específico
router.get(
  "/:id",
  authMiddleware,
  adminOrStaffMiddleware, // ✅ CAMBIADO: de sin middleware adicional a adminOrStaffMiddleware
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(getPartidoController)
);

// ✅ POST - Solo Admin puede crear partidos
router.post(
  "/",
  authMiddleware,
  adminMiddleware, // ✅ MANTIENE: Solo admin puede crear
  [
    body("codtipo")
      .isInt()
      .withMessage(
        "El código de tipo es obligatorio y debe ser un número entero."
      ),
    body("idequipo1")
      .isInt()
      .withMessage(
        "El ID de equipo 1 es obligatorio y debe ser un número entero."
      ),
    body("idequipo2")
      .isInt()
      .withMessage(
        "El ID de equipo 2 es obligatorio y debe ser un número entero."
      ),
    body("idzona")
      .isInt()
      .withMessage("El ID de zona es obligatorio y debe ser un número entero."),
    body("codestado")
      .isInt()
      .withMessage(
        "El código de estado es obligatorio y debe ser un número entero."
      ),
  ],
  validateRequest,
  asyncHandler(createPartidoController)
);

// ✅ PUT - Admin y Staff pueden actualizar (con validación de campos en el controlador)
router.put(
  "/:id",
  authMiddleware,
  adminOrStaffMiddleware, // ✅ CAMBIADO: de adminMiddleware a adminOrStaffMiddleware
  [
    param("id").isInt().withMessage("El ID debe ser un número entero."),
    body("codtipo")
      .optional()
      .isInt()
      .withMessage("El código de tipo debe ser un número entero."),
    body("idequipo1")
      .optional()
      .isInt()
      .withMessage("El ID de equipo 1 debe ser un número entero."),
    body("idequipo2")
      .optional()
      .isInt()
      .withMessage("El ID de equipo 2 debe ser un número entero."),
    body("idzona")
      .optional()
      .isInt()
      .withMessage("El ID de zona debe ser un número entero."),
    body("codestado")
      .optional()
      .isInt()
      .withMessage("El código de estado debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(updatePartidoController)
);

// ✅ DELETE - Solo Admin puede eliminar partidos
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware, // ✅ MANTIENE: Solo admin puede eliminar
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(deletePartidoController)
);

export default router;
