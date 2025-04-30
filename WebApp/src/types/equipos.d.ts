export interface Equipo {
  id?: number;
  nombre: string;
  abrev?: string;
  iniciales?: string;
  coddeporte: number;
  idsede?: number;
  contacto?: string;
  emailcto?: string;
  telefonocto?: string;
  celularcto?: string;
  contrasenia?: string;
  buenafe?: number;
  codcateg?: number;
  archivoubic?: string;
  archivosize?: number;
  archivonom?: string;
  saldoDeposito?: number;
  observ?: string;
  foto?: string;
  codestado?: number;
  fhcarga?: string;
  fhbaja?: string | null;
  fhultmod?: string;
  usrultmod?: number;
  sede_nombre?: string;
  [key: string]: unknown;
}

export interface EquipoInput {
  nombre: string;
  abrev?: string;
  iniciales?: string;
  coddeporte: number;
  idsede?: number;
  contacto?: string;
  emailcto?: string;
  telefonocto?: string;
  celularcto?: string;
  contrasenia?: string;
  buenafe?: number;
  codcateg?: number;
  archivoubic?: string;
  archivosize?: number;
  archivonom?: string;
  saldoDeposito?: number;
  observ?: string;
  foto?: string;
  codestado?: number;
  sede_nombre?: string;
}
