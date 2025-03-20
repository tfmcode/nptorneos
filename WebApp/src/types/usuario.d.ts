export interface Usuario {
  idusuario?: number;
  nombre: string;
  apellido: string;
  email: string;
  contrasenia?: string;
  habilitado: 0 | 1; // 🔹 Solo 0 o 1, sin números generales
  fhcarga?: string;
  perfil: 1 | 2 | 3; // 🔹 Solo valores permitidos
  fhbaja?: string | null;
  [key: string]: unknown;
}

export interface UsuarioInput {
  nombre: string;
  apellido: string;
  email: string;
  contrasenia?: string;
  habilitado?: 0 | 1; // 🔹 Solo 0 o 1
  perfil?: 1 | 2 | 3; // 🔹 Solo valores permitidos
}
