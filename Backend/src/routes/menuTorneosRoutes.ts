import express from "express";
import {
  createMenuTorneoController,
  getMenuTorneosController,
  updateMenuTorneoController,
  deleteMenuTorneoController,
} from "../controllers/menuTorneosController";

import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { body, param } from "express-validator";

const router = express.Router();

router.get(
  "/:idopcion",
  authMiddleware,
  [
    param("idopcion")
      .isInt()
      .withMessage("El ID de opción debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(getMenuTorneosController)
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  [
    body("idopcion")
      .isInt()
      .withMessage(
        "El ID de opción es obligatorio y debe ser un número entero."
      ),
    body("idtorneo")
      .optional({ nullable: true })
      .isInt()
      .withMessage("El ID de torneo debe ser un número entero."),
    body("descripcion")
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 100 })
      .withMessage("La descripción no puede exceder los 100 caracteres."),
    body("orden")
      .isInt()
      .withMessage("El orden es obligatorio y debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(createMenuTorneoController)
);

router.put(
  "/:idopcion/:orden",
  authMiddleware,
  adminMiddleware,
  [
    param("idopcion")
      .isInt()
      .withMessage("El ID de opción debe ser un número entero."),
    param("orden").isInt().withMessage("El orden debe ser un número entero."),
    body("idtorneo")
      .optional({ nullable: true })
      .isInt()
      .withMessage("El ID de torneo debe ser un número entero."),
    body("descripcion")
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 100 })
      .withMessage("La descripción no puede exceder los 100 caracteres."),
    body("orden")
      .optional()
      .isInt()
      .withMessage("El orden debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(updateMenuTorneoController)
);

router.delete(
  "/:idopcion/:orden",
  authMiddleware,
  adminMiddleware,
  [
    param("idopcion")
      .isInt()
      .withMessage("El ID de opción debe ser un número entero."),
    param("orden").isInt().withMessage("El orden debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(deleteMenuTorneoController)
);

export default router;
