import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// 🔹 Interfaz extendida para incluir `user`
interface AuthRequest extends Request {
  user?: JwtPayload & { id: string; email: string; perfil: number };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Acceso denegado. Token no proporcionado." });
  }

  // 🔹 Usamos regex para extraer el token correctamente
  const tokenMatch = authHeader.match(/^Bearer\s(.+)$/);
  const token = tokenMatch ? tokenMatch[1] : authHeader;

  try {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      console.error(
        "❌ Error: JWT_SECRET no está definido en las variables de entorno."
      );
      return res.status(500).json({ message: "Error interno del servidor." });
    }

    const decoded = jwt.verify(token, secretKey) as JwtPayload;

    if (!decoded.id || !decoded.email || decoded.perfil === undefined) {
      return res.status(401).json({ message: "Token inválido." });
    }

    req.user = decoded as AuthRequest["user"];
    next();
  } catch (error: any) {
    console.error("❌ Error en authMiddleware:", error);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expirado. Inicia sesión nuevamente." });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token inválido." });
    }

    return res.status(500).json({ message: "Error de autenticación." });
  }
};
