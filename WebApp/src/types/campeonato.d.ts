export interface Campeonato {
  id?: number;
  nombre: string;
  coddeporte: number;
  codestado?: number;
  fhcarga?: string; 
  fhbaja?: string | null; 
  fhultmod?: string; 
  usrultmod?: number;
  [key: string]: unknown;
}

export interface CampeonatoInput {
  nombre: string;
  coddeporte: number;
  codestado?: number;
}
