import axios from "axios";
import { Torneo } from "../types/torneos";
import { Zona } from "../types/zonas";
import { Partido } from "../types/partidos";
import { Sancion } from "../types/sanciones";

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
