import axios from "axios";
import {
  Partido,
  Sancion,
  Goleador,
  Torneo,
  Zona,
  Posicion,
  SancionPorZona,
  FichaPartido,
} from "../types/";

const API_URL = import.meta.env.VITE_API_URL || "https://nptorneos.com.ar";

interface PublicTorneo extends Torneo {
  sede_nombre: string | null;
  domicilio: string | null;
  localidad: string | null;
  provincia: string | null;
  latitud: string | null;
  longitud: string | null;
}

interface PublicTorneoResponse {
  torneo: PublicTorneo;
  zonas: Zona[];
  partidos: Partido[];
  sanciones: Sancion[];
}

export const getPublicTorneoById = async (
  id: number
): Promise<PublicTorneoResponse> => {
  const { data } = await axios.get(`${API_URL}/api/public/torneos/${id}`);
  return data;
};

export const getPosicionesByTorneoId = async (
  idtorneo: number
): Promise<Posicion[]> => {
  const { data } = await axios.get(
    `${API_URL}/api/public/torneos/${idtorneo}/posiciones`
  );
  return data;
};

export const getGoleadoresByZonaId = async (
  zonaId: number
): Promise<Goleador[]> => {
  const { data } = await axios.get(
    `${API_URL}/api/public/torneos/zonas/${zonaId}/goleadores`
  );
  return data;
};

export const getSancionesPorZona = async (
  idzona: number
): Promise<SancionPorZona[]> => {
  const { data } = await axios.get(
    `${API_URL}/api/public/torneos/zonas/${idzona}/sanciones`
  );
  return data;
};

export const getFichaPartido = async (
  idpartido: number
): Promise<FichaPartido> => {
  const { data } = await axios.get(
    `${API_URL}/api/public/torneos/partido/${idpartido}/ficha`
  );
  return data;
};
