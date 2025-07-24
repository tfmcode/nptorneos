import express from "express";
import {
  createFacturaController,
  getFactura,
  updateFacturaController,
  deleteFacturaController,
  getFacturasController,
} from "../controllers/facturasController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getFacturasController));
router.get("/:id", authMiddleware, asyncHandler(getFactura));

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  asyncHandler(createFacturaController)
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(updateFacturaController)
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteFacturaController)
);

export default router;
