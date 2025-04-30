import express from "express";
import {
  createEquipoController,
  getEquipos,
  getEquipo,
  updateEquipoController,
  deleteEquipoController,
} from "../controllers/equiposController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getEquipos));
router.get("/:id", authMiddleware, asyncHandler(getEquipo));
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  asyncHandler(createEquipoController)
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(updateEquipoController)
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteEquipoController)
);

export default router;
