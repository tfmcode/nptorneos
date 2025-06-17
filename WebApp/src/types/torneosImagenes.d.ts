export interface TorneosImagen {
  id?: number;
  idtorneo?: number;
  idzona?: number;
  idimagen?: number;
  descripcion?: string;
  nombre?: string;
  ubicacion?: string;
  home?: number;
  orden?: number;
  fhcarga?: string;
  usrultmod?: number;
  fhultmod?: string;
  fhbaja?: string;
  [key: string]: unknown;
}

export interface TorneosImagenInput {
  idtorneo?: number;
  idzona?: number;
  idimagen?: number;
  descripcion?: string;
  nombre?: string;
}
