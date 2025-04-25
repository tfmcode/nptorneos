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
import { zodValidate } from "../middlewares/zodValidate";
import {
  usuarioLoginSchema,
  usuarioCreateSchema,
} from "../validators/usuarioSchema";

const router = express.Router();

router.post(
  "/login",
  zodValidate(usuarioLoginSchema),
  asyncHandler(loginUsuario)
);

router.get("/", authMiddleware, adminMiddleware, asyncHandler(getUsuarios));
router.get("/:id", authMiddleware, asyncHandler(getUsuario));

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  zodValidate(usuarioCreateSchema),
  asyncHandler(createUsuarioController)
);

router.put("/:id", authMiddleware, asyncHandler(updateUsuarioController));

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteUsuarioController)
);

export default router;
