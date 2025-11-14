import express from "express";
import { upload } from "../config/multerConfig";
import {
  uploadJugadorImagen,
  deleteJugadorImagen,
  getJugadorImagenInfo,
} from "../controllers/uploadController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { adminOrStaffMiddleware } from "../middlewares/adminOrStaffMiddleware"; // ✅ NUEVO
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

// ====================================
// 📸 RUTAS DE IMÁGENES - JUGADORES
// ====================================

/**
 * POST /api/upload/jugador/:id
 * Subir o reemplazar imagen de jugador
 * Requiere autenticación de admin o staff
 */
router.post(
  "/jugador/:id",
  authMiddleware,
  adminOrStaffMiddleware, // ✅ CAMBIADO
  upload.single("imagen"),
  asyncHandler(uploadJugadorImagen)
);

/**
 * DELETE /api/upload/jugador/:id
 * Eliminar imagen de jugador
 * Requiere autenticación de admin o staff
 */
router.delete(
  "/jugador/:id",
  authMiddleware,
  adminOrStaffMiddleware, // ✅ CAMBIADO
  asyncHandler(deleteJugadorImagen)
);

/**
 * GET /api/upload/jugador/:id/info
 * Obtener información de imagen de jugador
 * Requiere autenticación de admin o staff
 */
router.get(
  "/jugador/:id/info",
  authMiddleware,
  adminOrStaffMiddleware, // ✅ CAMBIADO
  asyncHandler(getJugadorImagenInfo)
);

export default router;
