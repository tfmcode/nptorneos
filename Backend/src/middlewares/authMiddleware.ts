import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// 🔹 Interfaz extendida para incluir `user`
interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acceso denegado. Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET || "claveSecreta"
    );

    req.user = decoded as JwtPayload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado." }); // 🔥 Ahora avisa si el token ya no sirve
  }
};
