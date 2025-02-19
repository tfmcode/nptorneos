export interface Player {
  _id: string;
  firstName: string;
  lastName: string;
  document: string;
  birthday: string;
  enabled: boolean;
  email?: string;
  phone?: string;
  twitter?: string;
  instagram?: string;
  weight?: number;
  height?: number;
  position?: string;
  goodLeg?: "left" | "right" | "both";
  team?: string;
  picture?: string;
  nickname?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown; // Permite cumplir con `Record<string, unknown>`
}

export interface PlayerInput {
  firstName: string;
  lastName: string;
  document: string;
  birthday: string;
  enabled: boolean;
  email?: string;
  phone?: string;
  twitter?: string;
  instagram?: string;
  weight?: number;
  height?: number;
  position?: string;
  goodLeg?: "left" | "right" | "both";
  team?: string;
  picture?: string;
  nickname?: string;
  category?: string;
}
