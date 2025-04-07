export interface Codificador {
  id: number;
  idcodificador: number;
  descripcion?: string;
  habilitado: "0" | "1";
  fhcarga: string;
  fhbaja?: string | null;
  [key: string]: unknown;
}

export interface CodificadorInput {
  id?: number;
  idcodificador: number;
  descripcion?: string;
  habilitado?: "0" | "1";
  [key: string]: unknown;
}
