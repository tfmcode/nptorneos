export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string; // Opcional si no siempre necesitas enviar la contraseña
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
}
