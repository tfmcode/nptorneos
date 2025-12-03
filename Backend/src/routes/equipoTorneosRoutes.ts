import express from "express";
import { getTorneosByEquipoController } from "../controllers/equipoTorneosController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validationMiddleware";
import { param } from "express-validator";

const router = express.Router();

router.get(
  "/equipo/:idEquipo",
  authMiddleware,
  [
    param("idEquipo")
      .isInt()
      .withMessage("El ID de equipo debe ser un número entero."),
  ],
  validateRequest,
  asyncHandler(getTorneosByEquipoController)
);

export default router;
