import { AxiosError } from "axios";
import API from "./httpClient";
import { Codificador, CodificadorInput } from "../types/codificador";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getCodificadores = async (): Promise<Codificador[]> => {
  try {
    const response = await API.get("/api/codificadores");
    return response.data ?? [];
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};

export const saveCodificador = async (data: CodificadorInput) => {
  try {
    const response =
      data.id && data.idcodificador
        ? await API.put(
            `/api/codificadores/${data.id}/${data.idcodificador}`,
            data
          )
        : await API.post("/api/codificadores", data);

    return response.data.codificador;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteCodificador = async (
  id: number,
  idcodificador: number
): Promise<void> => {
  try {
    await API.delete(`/api/codificadores/${id}/${idcodificador}`);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getTurnos = async (): Promise<Codificador[]> => {
  try {
    const response = await getCodificadores();
    return response.filter((c) => c.idcodificador === 7 && c.codestado === "1");
  } catch (error) {
    handleAxiosError(error);
  }
  return [];
};
