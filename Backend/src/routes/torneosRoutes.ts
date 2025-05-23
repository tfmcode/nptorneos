import express from "express";
import {
  createTorneoController,
  getTorneos,
  getTorneo,
  updateTorneoController,
  deleteTorneoController,
} from "../controllers/torneosController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { body, param } from "express-validator";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getTorneos));
router.get(
  "/:id",
  authMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(getTorneo)
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
      .withMessage("El nombre no puede exceder los 255 caracteres."),
    body("codmodelo")
      .isInt()
      .withMessage("El código de modelo debe ser un número entero."),
    body("codestado")
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null) return true;
        if (!Number.isInteger(value)) {
          throw new Error("El código de estado debe ser un número entero.");
        }
        return true;
      }),
    body("usrultmod")
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null) return true;
        if (!Number.isInteger(value)) {
          throw new Error(
            "El usuario de última modificación debe ser un número entero."
          );
        }
        return true;
      })
  ],
  validateRequest,
  asyncHandler(createTorneoController)
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
    body("codmodelo")
      .optional()
      .isInt()
      .withMessage("El código de modelo debe ser un número entero."),
    body("codestado")
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null) return true;
        if (!Number.isInteger(value)) {
          throw new Error("El código de estado debe ser un número entero.");
        }
        return true;
      }),
    body("usrultmod")
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null) return true;
        if (!Number.isInteger(value)) {
          throw new Error(
            "El usuario de última modificación debe ser un número entero."
          );
        }
        return true;
      }),
  ],
  validateRequest,
  asyncHandler(updateTorneoController)
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(deleteTorneoController)
);

export default router;
