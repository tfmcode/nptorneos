export interface Sede {
  id?: number;
  nombre: string;
  domicilio: string;
  provincia?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  emailcto?: string;
  telefonocto?: string;
  celularcto?: string;
  latitud?: string;
  longitud?: string;
  descripcion?: string;
  codestado?: number;
  mapa?: number;
  cpostal?: string;
  localidad?: string;
  fhcarga?: string;
  fhbaja?: string | null;
  [key: string]: unknown;
}

export interface SedeInput {
  nombre: string;
  domicilio: string;
  provincia?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  emailcto?: string;
  telefonocto?: string;
  celularcto?: string;
  latitud?: string;
  longitud?: string;
  descripcion?: string;
  codestado?: number;
  mapa?: number;
  cpostal?: string;
  localidad?: string;
}
