import express from "express";
import {
  getCuentaCorrienteEquipoController,
  getCuentasCorrientesGeneralController,
} from "../controllers/cuentasCorrientesController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validationMiddleware";
import { param } from "express-validator";

const router = express.Router();

// Obtener cuenta corriente de un equipo específico
router.get(
  "/equipo/:idequipo",
  authMiddleware,
  adminMiddleware, // Solo admin puede ver cuentas corrientes
  [
    param("idequipo")
      .isInt()
      .withMessage("El ID de equipo debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(getCuentaCorrienteEquipoController)
);

// Obtener resumen de cuentas corrientes de todos los equipos
router.get(
  "/general",
  authMiddleware,
  adminMiddleware, // Solo admin puede ver cuentas corrientes
  asyncHandler(getCuentasCorrientesGeneralController)
);

export default router;
