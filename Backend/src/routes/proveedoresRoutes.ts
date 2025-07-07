import express from "express";
import {
  createProveedorController,
  getProveedores,
  getProveedor,
  updateProveedorController,
  deleteProveedorController,
} from "../controllers/proveedoresController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { body, param } from "express-validator";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getProveedores));

router.get(
  "/:id",
  authMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(getProveedor)
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
      .isLength({ max: 100 })
      .withMessage("El nombre no puede exceder los 100 caracteres."),
    body("codtipo")
      .isInt()
      .withMessage("El tipo de proveedor debe ser un número entero."),
    body("cuit").custom((value, { req }) => {
      const codtipo = Number(req.body.codtipo);
      if (codtipo === 4) {
        if (!value || value.trim() === "") {
          throw new Error(
            "El campo CUIT es obligatorio para proveedores tipo OTROS."
          );
        }
        if (value.length > 20) {
          throw new Error("El CUIT no puede exceder los 20 caracteres.");
        }
      }
      return true;
    }),
    body("email").optional().isEmail().withMessage("El email debe ser válido."),
    body("telefono")
      .optional()
      .isString()
      .isLength({ max: 60 })
      .withMessage("El teléfono no puede exceder los 60 caracteres."),
  ],
  validateRequest,
  asyncHandler(createProveedorController)
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
      .isLength({ max: 100 })
      .withMessage("El nombre no puede exceder los 100 caracteres."),
    body("codtipo")
      .optional()
      .isInt()
      .withMessage("El tipo de proveedor debe ser un número entero."),
    body("cuit").custom((value, { req }) => {
      const codtipo = Number(req.body.codtipo);
      if (codtipo === 4) {
        if (!value || value.trim() === "") {
          throw new Error(
            "El campo CUIT es obligatorio para proveedores tipo OTROS."
          );
        }
        if (value.length > 20) {
          throw new Error("El CUIT no puede exceder los 20 caracteres.");
        }
      }
      return true;
    }),
    body("email").optional().isEmail().withMessage("El email debe ser válido."),
    body("telefono")
      .optional()
      .isString()
      .isLength({ max: 60 })
      .withMessage("El teléfono no puede exceder los 60 caracteres."),
  ],
  validateRequest,
  asyncHandler(updateProveedorController)
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(deleteProveedorController)
);

export default router;
