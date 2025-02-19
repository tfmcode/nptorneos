import { Request, Response, NextFunction } from "express";
import { User } from "../models/userModel";
import { JwtPayload } from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: JwtPayload & { id: string }; // 🔹 Extender `JwtPayload` con `id`
}

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "No autorizado." });
  }

  const user = await User.findById(req.user.id);
  if (!user || user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Acceso denegado. Se requiere rol de administrador." });
  }

  next();
};
