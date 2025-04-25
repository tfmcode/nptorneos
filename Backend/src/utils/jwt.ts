import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// 🔐 Aseguramos que la clave esté definida
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  console.error("⚠️ Error: JWT_SECRET no está definido en el archivo .env");
  throw new Error("Falta la clave secreta JWT en el archivo .env");
}

// 🎯 Tipo de datos que va a tener nuestro token
export interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
  perfil: number;
}

/**
 * 🔐 Genera un token JWT válido por 2 horas
 * @param userId ID del usuario
 * @param email Email del usuario
 * @param perfil Rol del usuario (1 = Admin, 2 = Staff, etc.)
 */
export const generateToken = (
  userId: string,
  email: string,
  perfil: number
): string => {
  const payload: TokenPayload = { id: userId, email, perfil };
  return jwt.sign(payload, SECRET, {
    expiresIn: "2h",
  });
};

/**
 * 🔍 Verifica y decodifica un token JWT
 * @param token Token JWT recibido
 * @returns Datos decodificados del usuario o `null` si es inválido
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch (error) {
    console.error("❌ Error al verificar el token:", error);
    return null;
  }
};
