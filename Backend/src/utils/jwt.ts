import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "claveSecreta";

export const generateToken = (userId: string, email: string, role: string) => {
  return jwt.sign({ id: userId, email, role }, SECRET, { expiresIn: "2h" });
};
