import express from "express";
import {
  createInscripcionController,
  getInscripciones,
  getInscripcion,
  updateInscripcionController,
  deleteInscripcionController,
  updateEquipoAsocController,
} from "../controllers/inscripcionesController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getInscripciones));
router.get("/:id", authMiddleware, asyncHandler(getInscripcion));

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  asyncHandler(createInscripcionController)
);
router.put(
  "/:id/equipo",
  authMiddleware,
  adminMiddleware,
  asyncHandler(updateEquipoAsocController)
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(updateInscripcionController)
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteInscripcionController)
);

export default router;
