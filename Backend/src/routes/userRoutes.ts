import express from "express";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  loginUser,
} from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

// 🟢 Rutas públicas
router.post("/login", asyncHandler(loginUser)); // Iniciar sesión sin token
router.post("/", asyncHandler(createUser)); // Crear usuario sin token

// 🔴 Rutas protegidas (solo accesibles con token)
router.get("/", authMiddleware, asyncHandler(getUsers)); // Ver usuarios (requiere autenticación)
router.put("/:id", authMiddleware, asyncHandler(updateUser)); // Editar usuarios (requiere autenticación)
router.delete("/:id", authMiddleware, asyncHandler(deleteUser)); // Eliminar usuarios (requiere autenticación)

export default router;
