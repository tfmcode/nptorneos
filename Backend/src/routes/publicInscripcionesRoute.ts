import express from "express";
import { createInscripcionPublicController } from "../controllers/publicInscripcionesController";
import { asyncHandler } from "../middlewares/asyncHandler";
import { publicLimiter } from "../config/rateLimitConfig";

const router = express.Router();

router.post(
  "/",
  publicLimiter,
  asyncHandler(createInscripcionPublicController)
);

export default router;
