import express from "express";
import {
  createSedeController,
  getSedes,
  getSede,
  updateSedeController,
  deleteSedeController,
} from "../controllers/sedesController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getSedes));
router.get("/:id", authMiddleware, asyncHandler(getSede));

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  asyncHandler(createSedeController)
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(updateSedeController)
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteSedeController)
);

export default router;
