import { AxiosError } from "axios";
import API from "./httpClient";
import { Partido } from "../types/partidos";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getPartidosByZona = async (idZona: number): Promise<Partido[]> => {
  try {
    const response = await API.get(`/api/partidos/zona/${idZona}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

export const getPartido = async (id: number): Promise<Partido | null> => {
  try {
    const response = await API.get(`/api/partidos/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return null;
};

const cleanPartidoData = (data: Partial<Partido>): Partial<Partido> => {
  const camposValidos: (keyof Partido)[] = [
    "idzona",
    "nrofecha",
    "fecha",
    "idsede",
    "codtipo",
    "idequipo1",
    "idequipo2",
    "codestado",
    "goles1",
    "goles2",
    "puntobonus1",
    "puntobonus2",
    "ausente1",
    "ausente2",
    "idusuario",
    "idprofesor",
    "idfecha",
    "observaciones",
    "arbitro",
    "incidencias",
    "formacion1",
    "formacion2",
    "cambios1",
    "cambios2",
    "dt1",
    "dt2",
    "suplentes1",
    "suplentes2",
  ];

  return camposValidos.reduce((acc, key) => {
    const value = data[key];

    // ⭐ CORRECCIÓN: Solo agregar el campo si existe en data (no es undefined)
    if (value !== undefined) {
      // Si el valor es cadena vacía o "0", convertir a null
      if (value === "" || value === "0") {
        acc[key] = null;
      } else {
        acc[key] = value;
      }
    }
    // Si value === undefined, NO agregamos el campo al objeto resultante

    return acc;
  }, {} as Partial<Partido>);
};

export const savePartido = async (
  data: Partial<Partido> & { id?: number }
): Promise<Partido> => {
  const cleaned = cleanPartidoData(data);
  const response = data.id
    ? await API.put(`/api/partidos/${data.id}`, cleaned)
    : await API.post("/api/partidos", cleaned);

  return response.data.partido;
};

export const deletePartido = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/partidos/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
