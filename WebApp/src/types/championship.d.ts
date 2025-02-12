export interface Championship {
  _id: string;
  name: string;
  sport: "Futbol" | "";
  tournaments: string[];
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown; // Permite cumplir con Record<string, unknown>
}

export interface ChampionshipInput {
  name: string;
  sport: "Futbol" | "";
  tournaments: string[];
  enabled: boolean;
}
