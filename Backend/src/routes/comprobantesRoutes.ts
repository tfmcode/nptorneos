import express from "express";
import {
  createComprobanteController,
  getComprobante,
  updateComprobanteController,
  deleteComprobanteController,
  getComprobantesController,
  getComprobanteModulo,
} from "../controllers/comprobantesController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getComprobantesController));

// ⚠️ IMPORTANTE: Ruta específica ANTES de la ruta con parámetro dinámico
router.get(
  "/modulo/:modulo",
  authMiddleware,
  asyncHandler(getComprobanteModulo)
);

router.get("/:codigo", authMiddleware, asyncHandler(getComprobante));

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  asyncHandler(createComprobanteController)
);
router.put(
  "/:codigo",
  authMiddleware,
  adminMiddleware,
  asyncHandler(updateComprobanteController)
);
router.delete(
  "/:codigo",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteComprobanteController)
);

export default router;
