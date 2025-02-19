import express from "express";
import {
  createChampionship,
  getChampionships,
  getChampionshipById,
  updateChampionship,
  deleteChampionship,
} from "../controllers/championshipController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

// ✅ Rutas de campeonatos con manejo de errores y protección
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  asyncHandler(createChampionship)
); // Crear campeonato
router.get("/", authMiddleware, asyncHandler(getChampionships)); // Obtener todos los campeonatos
router.get("/:id", authMiddleware, asyncHandler(getChampionshipById)); // Obtener un campeonato por ID
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(updateChampionship)
); // Editar campeonato
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteChampionship)
); // Eliminar campeonato

export default router;
