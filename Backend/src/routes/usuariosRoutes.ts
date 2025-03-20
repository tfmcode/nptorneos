import express from "express";
import {
  createUsuarioController,
  getUsuarios,
  getUsuario,
  updateUsuarioController,
  deleteUsuarioController,
  loginUsuario,
} from "../controllers/usuariosController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = express.Router();

// 🔓 Rutas públicas (Login)
router.post("/login", asyncHandler(loginUsuario));

// 🔐 Rutas protegidas con autenticación
router.get("/", authMiddleware, adminMiddleware, asyncHandler(getUsuarios));
router.get("/:id", authMiddleware, asyncHandler(getUsuario));
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  asyncHandler(createUsuarioController)
);

// 🔄 Un usuario puede actualizarse a sí mismo, pero solo un admin puede modificar otros perfiles
router.put("/:id", authMiddleware, asyncHandler(updateUsuarioController));

// ❌ Soft delete (Solo admin puede desactivar usuarios)
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteUsuarioController)
);

export default router;
