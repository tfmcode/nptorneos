import express from "express";
import {
  getEquipos,
  getEquipoByIdController,
  createEquipoController,
  updateEquipoController,
  deleteEquipoController,
} from "../controllers/equiposController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validationMiddleware";
import { body, param } from "express-validator";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getEquipos));

router.get(
  "/:id",
  authMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(getEquipoByIdController)
);

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
      .withMessage("Máximo 255 caracteres."),

    body("emailcto")
      .optional()
      .isEmail()
      .withMessage("Debe ser un email válido."),

    body("saldodeposito")
      .optional()
      .isInt()
      .withMessage("El saldo debe ser un número entero."),

    body("codestado")
      .optional()
      .isInt()
      .withMessage("Debe ser un código de estado válido."),
  ],
  validateRequest,
  asyncHandler(createEquipoController)
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
      .isLength({ max: 255 }),

    body("emailcto")
      .optional()
      .isEmail()
      .withMessage("Debe ser un email válido."),
  ],
  validateRequest,
  asyncHandler(updateEquipoController)
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(deleteEquipoController)
);

export default router;
