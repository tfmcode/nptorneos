import express from "express";
import {
  getListaNegra,
  getRegistroListaNegra,
  createRegistroListaNegra,
  updateRegistroListaNegra,
  deleteRegistroListaNegra,
} from "../controllers/listaNegraController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getListaNegra));

router.get("/:id", authMiddleware, asyncHandler(getRegistroListaNegra));

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  asyncHandler(createRegistroListaNegra)
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(updateRegistroListaNegra)
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  asyncHandler(deleteRegistroListaNegra)
);

export default router;
