import { IUsuario } from "../models/usuariosModel";

export const sanitizeUser = (user: IUsuario) => ({
  idusuario: user.idusuario,
  nombre: user.nombre,
  apellido: user.apellido,
  email: user.email,
  perfil: user.perfil,
  habilitado: user.habilitado,
  fhcarga: user.fhcarga,
});
