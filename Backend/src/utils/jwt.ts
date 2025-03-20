import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // ✅ Asegurar que las variables de entorno están cargadas

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  console.error("⚠️ Error: JWT_SECRET no está definido en el archivo .env");
  throw new Error("Falta la clave secreta JWT en el archivo .env");
}

// 🔹 Definir la estructura del token para asegurar compatibilidad en TypeScript
interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
  perfil: number; // 🔹 Ahora `perfil` es un número en vez de `role` string
}

/**
 * 🔐 Genera un token JWT con los datos del usuario
 * @param userId ID del usuario
 * @param email Email del usuario
 * @param perfil Perfil del usuario (Ej: 1 = Admin, 2 = Staff, etc.)
 * @returns Token JWT válido por 2 horas
 */
export const generateToken = (
  userId: string,
  email: string,
  perfil: number
): string => {
  return jwt.sign({ id: userId, email, perfil } as TokenPayload, SECRET, {
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
