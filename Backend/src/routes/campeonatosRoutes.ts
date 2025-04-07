import express from "express";
import {
  createCampeonatoController,
  getCampeonatos,
  getCampeonato,
  updateCampeonatoController,
  deleteCampeonatoController,
} from "../controllers/campeonatosController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { body, param } from "express-validator";

const router = express.Router();

// 🔐 Rutas protegidas con autenticación
router.get("/", authMiddleware, asyncHandler(getCampeonatos));
router.get(
  "/:id",
  authMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(getCampeonato)
);

// 🆕 Solo admins pueden crear y eliminar campeonatos
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  [
    body("nombre")
      .trim()
      .notEmpty()
      .withMessage("El nombre es obligatorio.")
      .isLength({ max: 255 })
      .withMessage("El nombre no puede exceder los 255 caracteres."),
    body("coddeporte")
      .isInt()
      .withMessage("El código de deporte debe ser un número entero."),
    body("codestado")
      .optional({ nullable: true }) // Permite null explícitamente
      .custom((value) => {
        if (value === null) return true; // Acepta null
        if (!Number.isInteger(value)) {
          throw new Error("El código de estado debe ser un número entero.");
        }
        return true;
      }),
    body("usrultmod")
      .optional({ nullable: true }) // Permite null explícitamente
      .custom((value) => {
        if (value === null) return true; // Acepta null
        if (!Number.isInteger(value)) {
          throw new Error(
            "El usuario de última modificación debe ser un número entero."
          );
        }
        return true;
      }),
  ],
  validateRequest,
  asyncHandler(createCampeonatoController)
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [
    param("id").isInt().withMessage("El ID debe ser un número entero."),
    body("nombre")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El nombre no puede estar vacío.")
      .isLength({ max: 255 })
      .withMessage("El nombre no puede exceder los 255 caracteres."),
    body("coddeporte")
      .optional()
      .isInt()
      .withMessage("El código de deporte debe ser un número entero."),
    body("codestado")
      .optional({ nullable: true }) // Permite null explícitamente
      .custom((value) => {
        if (value === null) return true; // Acepta null
        if (!Number.isInteger(value)) {
          throw new Error("El código de estado debe ser un número entero.");
        }
        return true;
      }),
    body("usrultmod")
      .optional({ nullable: true }) // Permite null explícitamente
      .custom((value) => {
        if (value === null) return true; // Acepta null
        if (!Number.isInteger(value)) {
          throw new Error(
            "El usuario de última modificación debe ser un número entero."
          );
        }
        return true;
      }),
  ],
  validateRequest,
  asyncHandler(updateCampeonatoController)
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(deleteCampeonatoController)
);

export default router;
