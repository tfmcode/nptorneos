import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt"; // Usamos tu verifyToken centralizado

// 🔹 Extendemos Request para incluir `user`
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * 🔐 Middleware de autenticación.
 * Verifica el token JWT enviado en el header Authorization.
 */
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

  // 🔹 Extraemos el token del header (aceptamos formato Bearer TOKEN o solo TOKEN)
  const tokenMatch = authHeader.match(/^Bearer\s(.+)$/);
  const token = tokenMatch ? tokenMatch[1] : authHeader;

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: "Token inválido o expirado." });
  }

  // 🔹 Inyectamos el usuario en la request
  req.user = decoded;

  next();
};
