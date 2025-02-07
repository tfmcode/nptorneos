export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "admin" | "staff" | "user";
  enabled: boolean;
  [key: string]: unknown; // Permite cumplir con Record<string, unknown>
}

export interface UserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "admin" | "staff" | "user";
  enabled: boolean;
}
