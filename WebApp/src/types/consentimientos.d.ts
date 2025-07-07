export interface Consentimiento {
  id?: number;
  apellido?: string;
  nombres?: string;
  docnro: number;
  fechanac?: string;
  domicilio?: string;
  telefono?: string;
  obrasocial?: string;
  facebook?: string;
  idequipo?: number;
  codtipo?: number;
  idsede?: number;
  nombrecto?: string;
  relacioncto?: string;
  telefonocto?: string;
  fhcarga?: string;
  fhimpresion?: string;
  fhbaja?: string;
  [key: string]: unknown;
}
