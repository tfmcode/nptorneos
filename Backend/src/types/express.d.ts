import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

declare module "express" {
  export interface Request {
    user?: JwtPayload & {
      id: string;
      email: string;
      perfil: number;
    };
  }
}
