import express from "express";
import { upload } from "../config/multerConfig";
import {
  uploadJugadorImagen,
  deleteJugadorImagen,
  getJugadorImagenInfo,
} from "../controllers/uploadController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

// ====================================
// 📸 RUTAS DE IMÁGENES - JUGADORES
// ====================================

/**
 * POST /api/upload/jugador/:id
 * Subir o reemplazar imagen de jugador
 * Requiere autenticación de admin
 */
router.post(
  "/jugador/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("imagen"), // Campo esperado en FormData: "imagen"
  asyncHandler(uploadJugadorImagen)
);

/**
 * DELETE /api/upload/jugador/:id
 * Eliminar imagen de jugador
 * Requiere autenticación de admin
 */
router.delete(
  "/jugador/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteJugadorImagen)
);

/**
 * GET /api/upload/jugador/:id/info
 * Obtener información de imagen de jugador
 * Requiere autenticación
 */
router.get(
  "/jugador/:id/info",
  authMiddleware,
  asyncHandler(getJugadorImagenInfo)
);

export default router;
