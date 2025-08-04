import express from "express";
import { createInscripcionPublicController } from "../controllers/publicInscripcionesController";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

// POST /api/public/inscripciones
router.post("/", asyncHandler(createInscripcionPublicController));

export default router;
