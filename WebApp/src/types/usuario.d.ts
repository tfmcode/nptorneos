export interface Usuario {
  idusuario?: number;
  nombre: string;
  apellido: string;
  email: string;
  contrasenia?: string;
  habilitado: 0 | 1; 
  fhcarga?: string;
  perfil: 1 | 2 | 3;
  fhbaja?: string | null;
  [key: string]: unknown;
}

export interface UsuarioInput {
  nombre: string;
  apellido: string;
  email: string;
  contrasenia?: string;
  habilitado?: 0 | 1; 
  perfil?: 1 | 2 | 3; 
}
