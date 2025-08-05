import API from "./httpClient";
import { AxiosError } from "axios";
import { Fecha, FechaInput, FechaResumen } from "../types/fechas";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getFechas = async (
  desde?: string,
  hasta?: string,
  idtorneo?: number
): Promise<FechaResumen[]> => {
  try {
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    if (idtorneo) params.append("idtorneo", idtorneo.toString());

    const res = await API.get(`/api/fechas?${params.toString()}`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }

  return []; // ✅ fallback para evitar error TS
};

export const getFechaById = async (id: number): Promise<Fecha | null> => {
  try {
    const res = await API.get(`/api/fechas/${id}`);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }

  return null; // ✅ fallback para evitar error TS
};

export const saveFecha = async (
  data: FechaInput & { id?: number }
): Promise<Fecha | undefined> => {
  try {
    const res = data.id
      ? await API.put(`/api/fechas/${data.id}`, data)
      : await API.post("/api/fechas", data);
    return res.data.fecha;
  } catch (error) {
    handleAxiosError(error);
  }

  return undefined; // por completitud
};

export const deleteFecha = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/fechas/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
