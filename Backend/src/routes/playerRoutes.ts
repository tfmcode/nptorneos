import express from "express";
import {
  createPlayer,
  getPlayers,
  getPlayerById,
  updatePlayer,
  deletePlayer,
} from "../controllers/playerController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

// ✅ Rutas protegidas con autenticación y permisos de admin donde sea necesario
router.post("/", authMiddleware, adminMiddleware, asyncHandler(createPlayer)); // Crear jugador
router.get("/", authMiddleware, asyncHandler(getPlayers)); // Obtener todos los jugadores (con paginación)
router.get("/:id", authMiddleware, asyncHandler(getPlayerById)); // Obtener un jugador por ID
router.put("/:id", authMiddleware, adminMiddleware, asyncHandler(updatePlayer)); // Editar jugador
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deletePlayer)
); // Eliminar jugador

export default router;
