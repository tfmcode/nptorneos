export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  [key: string]: unknown; // Permite cumplir con Record<string, unknown>
}


export interface UserInput {
  name: string;
  email: string;
  password: string;
}
