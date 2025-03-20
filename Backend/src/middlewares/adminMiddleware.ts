import { Request, Response, NextFunction } from "express";
import { pool } from "../config/db";
import { JwtPayload } from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: JwtPayload & { id: string; email: string; perfil: number };
}

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.id || req.user.perfil === undefined) {
    return res.status(401).json({ message: "No autorizado." });
  }

  // Si ya tenemos el perfil en el token, evitamos consulta extra
  if (req.user.perfil === 1) {
    return next();
  }

  try {
    const userId = Number(req.user.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }

    // 🔹 Optimizamos la consulta para traer solo el perfil
    const { rows } = await pool.query(
      "SELECT perfil FROM usuarios WHERE idusuario = $1;",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (rows[0].perfil !== 1) {
      return res
        .status(403)
        .json({
          message: "Acceso denegado. Se requiere rol de administrador.",
        });
    }

    next();
  } catch (error) {
    console.error("❌ Error en adminMiddleware:", error);
    return res.status(500).json({ message: "Error en la autenticación." });
  }
};
