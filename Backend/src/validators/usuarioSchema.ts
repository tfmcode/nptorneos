import { z } from "zod";

export const usuarioLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  contrasenia: z
    .string()
    .min(5, "La contraseña debe tener al menos 6 caracteres"),
});

export const usuarioCreateSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  contrasenia: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  perfil: z.number().optional(),
  habilitado: z.number().optional(),
});
