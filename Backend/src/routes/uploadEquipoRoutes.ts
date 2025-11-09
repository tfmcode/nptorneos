import express from "express";
import { upload } from "../config/multerConfig";
import {
  uploadEquipoImagen,
  deleteEquipoImagen,
  getEquipoImagenInfo,
} from "../controllers/uploadEquipoController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

router.post(
  "/equipo/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("imagen"),
  asyncHandler(uploadEquipoImagen)
);

router.delete(
  "/equipo/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteEquipoImagen)
);

router.get(
  "/equipo/:id/info",
  authMiddleware,
  asyncHandler(getEquipoImagenInfo)
);

export default router;
