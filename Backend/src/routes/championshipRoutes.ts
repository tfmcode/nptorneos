import express from "express";
import {
  createChampionship,
  getChampionships,
  updateChampionship,
  addTournamentToChampionship,
  deleteChampionship,
} from "../controllers/championshipController";
import { authMiddleware } from "../middlewares/authMiddleware"; 
import { asyncHandler } from "../middlewares/asyncHandler"; 

const router = express.Router();

// Rutas de campeonatos
router.post("/", asyncHandler(createChampionship)); // Crear campeonato
router.get("/", authMiddleware, asyncHandler(getChampionships)); // Obtener todos los campeonatos
router.put("/:id", authMiddleware, asyncHandler(updateChampionship)); // Editar campeonato
router.delete("/:id", authMiddleware, asyncHandler(deleteChampionship)); // Eliminar campeonato
router.post(
  "/add-tournament",
  authMiddleware,
  asyncHandler(addTournamentToChampionship)
); // Asociar torneo a campeonato

export default router;
