import { AxiosError } from "axios";
import API from "./httpClient";
import { Campeonato, CampeonatoInput } from "../types/campeonato";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getCampeonatos = async (): Promise<Campeonato[]> => {
  try {
    const response = await API.get("/api/campeonatos");
    return response.data ?? [];
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

export const getCampeonatosGaleria = async (): Promise<Campeonato[]> => {
  try {
    const response = await API.get("/api/campeonatos?galeria=true");
    return response.data ?? [];
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

export const saveCampeonato = async (
  data: CampeonatoInput & { id?: number }
) => {
  try {
    const response = data.id
      ? await API.put(`/api/campeonatos/${data.id}`, data)
      : await API.post("/api/campeonatos", data);

    return response.data.campeonato;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteCampeonato = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/campeonatos/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
