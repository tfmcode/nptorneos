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
import { validateRequest } from "../middlewares/validationMiddleware";
import { body, param } from "express-validator";

const router = express.Router();

router.get(
  "/zona/:idZona",
  authMiddleware,
  [
    param("idZona")
      .isInt()
      .withMessage("El ID de la zona debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(getPartidosByZonaController)
);

router.get(
  "/:id",
  authMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(getPartidoController)
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
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

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
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

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").isInt().withMessage("El ID debe ser un número entero.")],
  validateRequest,
  asyncHandler(deletePartidoController)
);

export default router;
