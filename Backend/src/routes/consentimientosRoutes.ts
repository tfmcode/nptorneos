import express from "express";
import {
  createConsentimientoController,
  getConsentimientos,
  getConsentimiento,
  updateConsentimientoController,
  deleteConsentimientoController,
} from "../controllers/consentimientosController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { body, param } from "express-validator";
import { strictLimiter } from "../config/rateLimitConfig";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getConsentimientos));

router.get(
  "/:id",
  authMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(getConsentimiento)
);

router.post(
  "/",
  strictLimiter,
  [
    body("docnro")
      .isInt({ allow_leading_zeroes: false })
      .withMessage(
        "El número de documento (docnro) es obligatorio y debe ser un número."
      ),
    body("apellido")
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage("El apellido no puede exceder los 100 caracteres."),
    body("nombres")
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage("Los nombres no pueden exceder los 100 caracteres."),
    body("telefono")
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage("El teléfono no puede exceder los 100 caracteres."),
  ],
  validateRequest,
  asyncHandler(createConsentimientoController)
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [
    param("id").isInt().withMessage("El ID debe ser un número entero."),
    body("docnro")
      .optional()
      .isInt()
      .withMessage("El número de documento debe ser un número."),
    body("apellido")
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage("El apellido no puede exceder los 100 caracteres."),
    body("nombres")
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage("Los nombres no pueden exceder los 100 caracteres."),
    body("telefono")
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage("El teléfono no puede exceder los 100 caracteres."),
  ],
  validateRequest,
  asyncHandler(updateConsentimientoController)
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(deleteConsentimientoController)
);

export default router;
