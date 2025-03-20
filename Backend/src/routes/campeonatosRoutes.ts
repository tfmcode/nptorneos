import express from "express";
import {
  createCampeonatoController,
  getCampeonatos,
  getCampeonato,
  updateCampeonatoController,
  deleteCampeonatoController,
} from "../controllers/campeonatosController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = express.Router();

// 🔐 Rutas protegidas con autenticación
router.get("/", authMiddleware, asyncHandler(getCampeonatos));
router.get("/:id", authMiddleware, asyncHandler(getCampeonato));

// 🆕 Solo admins pueden crear y eliminar campeonatos
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  asyncHandler(createCampeonatoController)
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(updateCampeonatoController)
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteCampeonatoController)
);

export default router;
