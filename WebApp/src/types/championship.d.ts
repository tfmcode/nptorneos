export interface Championship {
  _id: string;
  name: string;
  sport: "Futbol" | "Otro"; // 🔹 Se permiten más deportes
  tournaments?: string[]; // IDs de torneos asociados
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown; // Permite cumplir con Record<string, unknown>
}

export interface ChampionshipInput {
  name: string;
  sport: "Futbol" | "Otro"; // 🔹 Se mantiene coherencia con `Championship`
  tournaments?: string[]; // 🔹 Opcional al crear un nuevo campeonato
  enabled: boolean;
}
