import { ZodTypeAny } from "zod";
import { Request, Response, NextFunction } from "express";

export const zodValidate =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Errores de validación",
        errors: result.error.errors,
      });
    }
    req.body = result.data;
    next();
  };
