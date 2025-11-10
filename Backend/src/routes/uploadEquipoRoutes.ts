// Backend/src/routes/uploadEquipoRoutes.ts

import express from "express";
import { upload } from "../config/multerConfig";
import {
  uploadEquipoEscudo, // ✅ Cambiado de uploadEquipoImagen
  deleteEquipoEscudo, // ✅ Cambiado de deleteEquipoImagen
  getEquipoEscudoInfo, // ✅ Cambiado de getEquipoImagenInfo
} from "../controllers/uploadEquipoController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

// ====================================
// 📸 RUTAS DE ESCUDO - EQUIPOS
// ====================================

/**
 * POST /api/upload/equipo/:id/escudo
 * Subir o reemplazar escudo de equipo
 * Requiere autenticación de admin
 */
router.post(
  "/equipo/:id/escudo",
  authMiddleware,
  adminMiddleware,
  upload.single("imagen"),
  asyncHandler(uploadEquipoEscudo)
);

/**
 * DELETE /api/upload/equipo/:id/escudo
 * Eliminar escudo de equipo
 * Requiere autenticación de admin
 */
router.delete(
  "/equipo/:id/escudo",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteEquipoEscudo)
);

/**
 * GET /api/upload/equipo/:id/escudo/info
 * Obtener información del escudo de equipo
 * Requiere autenticación
 */
router.get(
  "/equipo/:id/escudo/info",
  authMiddleware,
  asyncHandler(getEquipoEscudoInfo)
);

export default router;
