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
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = express.Router();

//  Rutas públicas
router.post("/login", asyncHandler(loginUser)); // Iniciar sesión sin token

//  Rutas protegidas
router.post("/", authMiddleware, adminMiddleware, asyncHandler(createUser));
router.get("/", authMiddleware, adminMiddleware, asyncHandler(getUsers));
router.put("/:id", authMiddleware, asyncHandler(updateUser)); // Un usuario puede actualizarse a sí mismo
router.delete("/:id", authMiddleware, adminMiddleware, asyncHandler(deleteUser));

export default router;
