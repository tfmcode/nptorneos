export interface Equipo {
  id?: number;
  nombre: string;
  abrev?: string;
  contacto?: string;
  emailcto?: string;
  telefonocto?: string;
  celularcto?: string;
  contrasenia?: string;
  buenafe?: number;
  codcateg?: number;
  coddeporte?: number;
  iniciales?: string;
  codestado?: number;
  archivoubic?: string;
  archivosize?: number;
  archivonom?: string;
  idsede?: number;
  fhcarga?: string;
  fhbaja?: string | null;
  idusuario?: number;
  foto?: string;
  observ?: string;
  fhultmod?: Date | string; 
  saldodeposito?: number;
  [key: string]: unknown;
}

export type EquipoInput = Omit<Equipo, "id" | "fhcarga" | "fhbaja">;
