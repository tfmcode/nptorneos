import { Request, Response, NextFunction } from "express";
import { pool } from "../config/db";
import { TokenPayload } from "../utils/jwt";

//  Extendemos Request con user del token ya validado
interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * 🔐 Middleware para verificar si el usuario es administrador (perfil = 1)
 */
export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autorizado." });
  }

  const { id, perfil } = req.user;

  // Si ya viene en el token que es admin, seguimos
  if (perfil === 1) return next();

  try {
    const userId = Number(id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }

    const { rows } = await pool.query(
      "SELECT perfil FROM usuarios WHERE idusuario = $1;",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (rows[0].perfil !== 1) {
      return res.status(403).json({
        message: "Acceso denegado. Se requiere rol de administrador.",
      });
    }

    next();
  } catch (error) {
    console.error("❌ Error en adminMiddleware:", error);
    return res
      .status(500)
      .json({ message: "Error interno en la autenticación." });
  }
};
