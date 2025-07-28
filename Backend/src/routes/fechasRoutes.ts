import express from "express";
import {
  getFechas,
  getFechaByIdController,
  createFechaController,
  updateFechaController,
  deleteFechaController,
} from "../controllers/fechasController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validationMiddleware";
import { body, param, query } from "express-validator";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  [
    query("desde")
      .optional()
      .isISO8601()
      .withMessage("Formato de fecha inválido (desde)"),
    query("hasta")
      .optional()
      .isISO8601()
      .withMessage("Formato de fecha inválido (hasta)"),
    query("idtorneo").optional().isInt().withMessage("ID de torneo inválido"),
  ],
  validateRequest,
  asyncHandler(getFechas)
);

router.get(
  "/:id",
  authMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(getFechaByIdController)
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  [
    body("fecha")
      .isISO8601()
      .withMessage("La fecha es obligatoria y debe tener formato válido."),
    body("idsede").isInt().withMessage("ID de sede obligatorio."),
    body("idsubsede").isInt().withMessage("ID de subsede obligatorio."),
    body("idtorneo").isInt().withMessage("ID de torneo obligatorio."),
    body("codfecha").isInt().withMessage("Código de fecha obligatorio."),
    body("idturno").isInt().withMessage("ID de turno obligatorio."),
    body("idprofesor")
      .optional()
      .isInt()
      .withMessage("ID de profesor inválido."),
    body("observ").optional().isString().isLength({ max: 255 }),
  ],
  validateRequest,
  asyncHandler(createFechaController)
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [
    param("id").isInt().withMessage("El ID debe ser un número entero."),
    body("fecha").optional().isISO8601(),
    body("idsede").optional().isInt(),
    body("idsubsede").optional().isInt(),
    body("idtorneo").optional().isInt(),
    body("codfecha").optional().isInt(),
    body("idturno").optional().isInt(),
    body("idprofesor").optional().isInt(),
    body("observ").optional().isString().isLength({ max: 255 }),
  ],
  validateRequest,
  asyncHandler(updateFechaController)
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(deleteFechaController)
);

export default router;
