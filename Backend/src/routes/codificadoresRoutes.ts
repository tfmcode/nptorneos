import express from "express";
import {
  createCodificadorController,
  getCodificadores,
  updateCodificadorController,
  deleteCodificadorController,
} from "../controllers/codificadoresController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { body, param } from "express-validator";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getCodificadores));

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  [
    body("idcodificador")
      .isInt()
      .withMessage("El ID del codificador debe ser un número entero."),
    body("descripcion")
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 60 })
      .withMessage("La descripción no puede exceder los 60 caracteres."),
    body("habilitado")
      .optional({ nullable: true })
      .isIn(["0", "1"])
      .withMessage("El campo habilitado debe ser '0' o '1'."),
  ],
  validateRequest,
  asyncHandler(createCodificadorController)
);

router.put(
  "/:id/:idcodificador",
  authMiddleware,
  adminMiddleware,
  [
    param("id").isInt().withMessage("El ID debe ser un número entero."),
    param("idcodificador")
      .isInt()
      .withMessage("El ID del codificador debe ser un número entero."),
    body("descripcion")
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 60 })
      .withMessage("La descripción no puede exceder los 60 caracteres."),
    body("habilitado")
      .optional({ nullable: true })
      .isIn(["0", "1"])
      .withMessage("El campo habilitado debe ser '0' o '1'."),
  ],
  validateRequest,
  asyncHandler(updateCodificadorController)
);

router.delete(
  "/:id/:idcodificador",
  authMiddleware,
  adminMiddleware,
  [
    param("id").isInt().withMessage("El ID debe ser un número entero."),
    param("idcodificador")
      .isInt()
      .withMessage("El ID del codificador debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(deleteCodificadorController)
);

export default router;
