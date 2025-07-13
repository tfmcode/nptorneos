import express from "express";
import {
  createInscripcionJugadorController,
  getInscripcionesJugadores,
  getInscripcionesJugadoresByInscripcionId,
  getInscripcionJugador,
  updateInscripcionJugadorController,
  deleteInscripcionJugadorController,
} from "../controllers/inscripcionesJugadoresController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getInscripcionesJugadores));
router.get(
  "/inscripcion/:idinscrip",
  authMiddleware,
  asyncHandler(getInscripcionesJugadoresByInscripcionId)
);
router.get("/:id", authMiddleware, asyncHandler(getInscripcionJugador));

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  asyncHandler(createInscripcionJugadorController)
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(updateInscripcionJugadorController)
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteInscripcionJugadorController)
);

export default router;
