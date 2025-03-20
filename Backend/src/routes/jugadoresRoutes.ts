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

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getJugadores));
router.get("/:id", authMiddleware, asyncHandler(getJugador));
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  asyncHandler(createJugadorController)
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(updateJugadorController)
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteJugadorController)
);

export default router;
