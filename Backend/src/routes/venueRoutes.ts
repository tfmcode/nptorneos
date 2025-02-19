import express from "express";
import {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
} from "../controllers/venueController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

// 📌 Rutas de sedes protegidas con autenticación
router.post("/",  asyncHandler(createVenue));
router.get("/", authMiddleware, asyncHandler(getVenues));
router.get("/:id", authMiddleware, asyncHandler(getVenueById));
router.put("/:id", authMiddleware, adminMiddleware, asyncHandler(updateVenue));
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteVenue)
);

export default router;
