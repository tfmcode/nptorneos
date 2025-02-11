import { Request, Response, NextFunction } from "express";

export const asyncHandler =
  (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };


  //Evitar repetir try/catch en todos los controladores. Usa un wrapper para manejar errores automáticamente.