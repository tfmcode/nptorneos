import express from "express";
import {
  createCajaMovimientoController,
  getCajaMovimiento,
  updateCajaMovimientoController,
  deleteCajaMovimientoController,
  getCajaMovimientosController,
  getCajaMovimientoFacturasPendientesController
} from "../controllers/cajamovimientosController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getCajaMovimientosController));
router.get("/:id", authMiddleware, asyncHandler(getCajaMovimiento));

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  asyncHandler(createCajaMovimientoController)
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(updateCajaMovimientoController)
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteCajaMovimientoController)
);
router.get(
  "/facturaspendientes/:proveedor",
  authMiddleware,
  adminMiddleware,
  asyncHandler(getCajaMovimientoFacturasPendientesController)
);
export default router;
