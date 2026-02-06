import express from "express";
import {
  createJugadorController,
  getJugadores,
  getJugador,
  updateJugadorController,
  deleteJugadorController,
} from "../controllers/jugadoresController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { adminOrStaffMiddleware } from "../middlewares/adminOrStaffMiddleware";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getJugadores));
router.get("/:id", authMiddleware, asyncHandler(getJugador));
router.post(
  "/",
  authMiddleware,
  adminOrStaffMiddleware,
  asyncHandler(createJugadorController)
);
router.put(
  "/:id",
  authMiddleware,
  adminOrStaffMiddleware,
  asyncHandler(updateJugadorController)
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteJugadorController)
);

export default router;
