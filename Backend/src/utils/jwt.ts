import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // ✅ Asegurar que las variables de entorno están cargadas

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  console.error("⚠️ Error: JWT_SECRET no está definido en el archivo .env");
  throw new Error("Falta la clave secreta JWT en el archivo .env");
}

export const generateToken = (userId: string, email: string, role: string) => {
  return jwt.sign({ id: userId, email, role }, SECRET, { expiresIn: "2h" });
};
