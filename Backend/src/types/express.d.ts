import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

declare module "express" {
  export interface Request {
    user?: string | JwtPayload; // Ahora `req.user` puede contener datos del usuario
  }
}
