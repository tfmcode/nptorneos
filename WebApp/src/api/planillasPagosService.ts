// Ubicación: WebApp/src/api/planillasPagoService.ts

import { AxiosError } from "axios";
import API from "./httpClient";
import {
  PlanillaPago,
  PlanillaPagoInput,
  PlanillaCompleta,
  PlanillasFiltros,
  PlanillaEquipoInput,
  PlanillaArbitroInput,
  PlanillaCanchaInput,
  PlanillaProfesorInput,
  PlanillaMedicoInput,
  PlanillaOtroGastoInput,
} from "../types/planillasPago";

const handleAxiosError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    console.error("❌ API Error:", error.response.data.message);
    throw new Error(error.response.data.message);
  }
  console.error("❌ Unexpected Error:", error);
  throw new Error("Ocurrió un error inesperado.");
};

export const getPlanillasByFiltros = async (
  filtros: PlanillasFiltros
): Promise<PlanillaPago[]> => {
  try {
    const params = new URLSearchParams();
    if (filtros.idtorneo) params.append("idtorneo", String(filtros.idtorneo));
    if (filtros.fecha_desde) params.append("fecha_desde", filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append("fecha_hasta", filtros.fecha_hasta);
    if (filtros.idsede) params.append("idsede", String(filtros.idsede));
    if (filtros.estado) params.append("estado", filtros.estado);

    const response = await API.get(`/api/planillas-pago?${params.toString()}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return []; // ← AGREGAR ESTO
};

export const getPlanillaCompleta = async (
  idfecha: number
): Promise<PlanillaCompleta | null> => {
  try {
    const response = await API.get(`/api/planillas-pago/${idfecha}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
  return null; // ← AGREGAR ESTO
};

export const createPlanilla = async (
  data: PlanillaPagoInput
): Promise<PlanillaPago | null> => {
  try {
    const response = await API.post("/api/planillas-pago", data);
    return response.data.planilla;
  } catch (error) {
    handleAxiosError(error);
  }
  return null; // ← AGREGAR ESTO
};

export const updatePlanilla = async (
  id: number,
  data: Partial<PlanillaPago>
): Promise<PlanillaPago | null> => {
  try {
    const response = await API.put(`/api/planillas-pago/${id}`, data);
    return response.data.planilla;
  } catch (error) {
    handleAxiosError(error);
  }
  return null; // ← AGREGAR ESTO
};

export const cerrarPlanilla = async (
  id: number
): Promise<PlanillaPago | null> => {
  try {
    const response = await API.post(`/api/planillas-pago/${id}/cerrar`);
    return response.data.planilla;
  } catch (error) {
    handleAxiosError(error);
  }
  return null; // ← AGREGAR ESTO
};

export const contabilizarPlanilla = async (
  id: number,
  idusuario: number
): Promise<PlanillaPago | null> => {
  try {
    const response = await API.post(`/api/planillas-pago/${id}/contabilizar`, {
      idusuario,
    });
    return response.data.planilla;
  } catch (error) {
    handleAxiosError(error);
  }
  return null; // ← AGREGAR ESTO
};

export const deletePlanilla = async (id: number): Promise<void> => {
  try {
    await API.delete(`/api/planillas-pago/${id}`);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const saveEquipoPlanilla = async (
  data: PlanillaEquipoInput
): Promise<void> => {
  try {
    await API.post("/api/planillas-pago/equipos", data);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteEquipoPlanilla = async (
  idfecha: number,
  orden: number
): Promise<void> => {
  try {
    await API.delete(`/api/planillas-pago/equipos/${idfecha}/${orden}`);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const saveArbitroPlanilla = async (
  data: PlanillaArbitroInput
): Promise<void> => {
  try {
    await API.post("/api/planillas-pago/arbitros", data);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteArbitroPlanilla = async (
  idfecha: number,
  orden: number
): Promise<void> => {
  try {
    await API.delete(`/api/planillas-pago/arbitros/${idfecha}/${orden}`);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const saveCanchaPlanilla = async (
  data: PlanillaCanchaInput
): Promise<void> => {
  try {
    await API.post("/api/planillas-pago/canchas", data);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteCanchaPlanilla = async (
  idfecha: number,
  orden: number
): Promise<void> => {
  try {
    await API.delete(`/api/planillas-pago/canchas/${idfecha}/${orden}`);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const saveProfesorPlanilla = async (
  data: PlanillaProfesorInput
): Promise<void> => {
  try {
    await API.post("/api/planillas-pago/profesores", data);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteProfesorPlanilla = async (
  idfecha: number,
  orden: number
): Promise<void> => {
  try {
    await API.delete(`/api/planillas-pago/profesores/${idfecha}/${orden}`);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const saveMedicoPlanilla = async (
  data: PlanillaMedicoInput
): Promise<void> => {
  try {
    await API.post("/api/planillas-pago/medico", data);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteMedicoPlanilla = async (
  idfecha: number,
  orden: number
): Promise<void> => {
  try {
    await API.delete(`/api/planillas-pago/medico/${idfecha}/${orden}`);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const saveOtroGastoPlanilla = async (
  data: PlanillaOtroGastoInput
): Promise<void> => {
  try {
    await API.post("/api/planillas-pago/otros-gastos", data);
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteOtroGastoPlanilla = async (
  idfecha: number,
  orden: number
): Promise<void> => {
  try {
    await API.delete(`/api/planillas-pago/otros-gastos/${idfecha}/${orden}`);
  } catch (error) {
    handleAxiosError(error);
  }
};
