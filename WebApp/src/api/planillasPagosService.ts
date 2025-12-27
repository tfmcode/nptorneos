import { AxiosError } from "axios";
import API from "./httpClient";
import {
  PlanillaPago,
  PlanillaCompleta,
  PlanillasFiltros,
  PlanillaEquipo,
  PlanillaEquipoInput,
  PlanillaArbitro,
  PlanillaArbitroInput,
  PlanillaCancha,
  PlanillaCanchaInput,
  PlanillaProfesor,
  PlanillaProfesorInput,
  PlanillaMedico,
  PlanillaMedicoInput,
  PlanillaOtroGasto,
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
    return handleAxiosError(error);
  }
};

export const getPlanillaCompleta = async (
  idfecha: number
): Promise<PlanillaCompleta | null> => {
  try {
    const response = await API.get(`/api/planillas-pago/${idfecha}`);
    const planillaCompleta = response.data;

    // ✅ SIMPLIFICADO: Ya no necesitamos llamar a /api/partidos porque:
    // 1. getEquiposByPlanilla trae los nombres de los equipos con JOIN
    // 2. El backend ya retorna partido_info completo
    // 3. Una caja puede tener MÚLTIPLES partidos, no solo uno

    return planillaCompleta;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const createPlanilla = async (
  idfecha: number
): Promise<PlanillaPago | null> => {
  try {
    const response = await API.post("/api/planillas-pago", { idfecha });
    return response.data.planilla;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const cerrarPlanilla = async (
  idfecha: number,
  idprofesor: number
): Promise<void> => {
  try {
    await API.post(`/api/planillas-pago/${idfecha}/cerrar`, { idprofesor });
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const cerrarCaja = async (
  idfecha: number,
  idusuario: number
): Promise<void> => {
  try {
    await API.post(`/api/planillas-pago/${idfecha}/cerrar-caja`, {
      idusuario,
    });
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateTurnoPlanilla = async (
  idfecha: number,
  idturno: number
): Promise<void> => {
  try {
    await API.put(`/api/planillas-pago/${idfecha}/turno`, { idturno });
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateEfectivoRealPlanilla = async (
  idfecha: number,
  totefectivo: number
): Promise<void> => {
  try {
    await API.put(`/api/planillas-pago/${idfecha}/efectivo-real`, { totefectivo });
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const addEquipoPlanilla = async (
  data: PlanillaEquipoInput
): Promise<PlanillaEquipo | null> => {
  try {
    const response = await API.post("/api/planillas-pago/equipos", data);
    return response.data.equipo;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateEquipoPlanilla = async (
  idfecha: number,
  orden: number,
  data: Partial<PlanillaEquipo>
): Promise<PlanillaEquipo | null> => {
  try {
    const response = await API.put(
      `/api/planillas-pago/equipos/${idfecha}/${orden}`,
      data
    );
    return response.data.equipo;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const deleteEquipoPlanilla = async (
  idfecha: number,
  orden: number
): Promise<void> => {
  try {
    await API.delete(`/api/planillas-pago/equipos/${idfecha}/${orden}`);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const addArbitroPlanilla = async (
  data: PlanillaArbitroInput
): Promise<PlanillaArbitro | null> => {
  try {
    const response = await API.post("/api/planillas-pago/arbitros", data);
    return response.data.arbitro;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateArbitroPlanilla = async (
  idfecha: number,
  orden: number,
  data: Partial<PlanillaArbitro>
): Promise<PlanillaArbitro | null> => {
  try {
    const response = await API.put(
      `/api/planillas-pago/arbitros/${idfecha}/${orden}`,
      data
    );
    return response.data.arbitro;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const deleteArbitroPlanilla = async (
  idfecha: number,
  orden: number
): Promise<void> => {
  try {
    await API.delete(`/api/planillas-pago/arbitros/${idfecha}/${orden}`);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const addCanchaPlanilla = async (
  data: PlanillaCanchaInput
): Promise<PlanillaCancha | null> => {
  try {
    const response = await API.post("/api/planillas-pago/canchas", data);
    return response.data.cancha;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateCanchaPlanilla = async (
  idfecha: number,
  orden: number,
  data: Partial<PlanillaCancha>
): Promise<PlanillaCancha | null> => {
  try {
    const response = await API.put(
      `/api/planillas-pago/canchas/${idfecha}/${orden}`,
      data
    );
    return response.data.cancha;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const deleteCanchaPlanilla = async (
  idfecha: number,
  orden: number
): Promise<void> => {
  try {
    await API.delete(`/api/planillas-pago/canchas/${idfecha}/${orden}`);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const addProfesorPlanilla = async (
  data: PlanillaProfesorInput
): Promise<PlanillaProfesor | null> => {
  try {
    const response = await API.post("/api/planillas-pago/profesores", data);
    return response.data.profesor;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateProfesorPlanilla = async (
  idfecha: number,
  orden: number,
  data: Partial<PlanillaProfesor>
): Promise<PlanillaProfesor | null> => {
  try {
    const response = await API.put(
      `/api/planillas-pago/profesores/${idfecha}/${orden}`,
      data
    );
    return response.data.profesor;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const deleteProfesorPlanilla = async (
  idfecha: number,
  orden: number
): Promise<void> => {
  try {
    await API.delete(`/api/planillas-pago/profesores/${idfecha}/${orden}`);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const addMedicoPlanilla = async (
  data: PlanillaMedicoInput
): Promise<PlanillaMedico | null> => {
  try {
    const response = await API.post("/api/planillas-pago/medico", data);
    return response.data.medico;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateMedicoPlanilla = async (
  idfecha: number,
  orden: number,
  data: Partial<PlanillaMedico>
): Promise<PlanillaMedico | null> => {
  try {
    const response = await API.put(
      `/api/planillas-pago/medico/${idfecha}/${orden}`,
      data
    );
    return response.data.medico;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const deleteMedicoPlanilla = async (
  idfecha: number,
  orden: number
): Promise<void> => {
  try {
    await API.delete(`/api/planillas-pago/medico/${idfecha}/${orden}`);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const addOtroGastoPlanilla = async (
  data: PlanillaOtroGastoInput
): Promise<PlanillaOtroGasto | null> => {
  try {
    const response = await API.post("/api/planillas-pago/otros-gastos", data);
    return response.data.gasto;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateOtroGastoPlanilla = async (
  idfecha: number,
  orden: number,
  data: Partial<PlanillaOtroGasto>
): Promise<PlanillaOtroGasto | null> => {
  try {
    const response = await API.put(
      `/api/planillas-pago/otros-gastos/${idfecha}/${orden}`,
      data
    );
    return response.data.gasto;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const deleteOtroGastoPlanilla = async (
  idfecha: number,
  orden: number
): Promise<void> => {
  try {
    await API.delete(`/api/planillas-pago/otros-gastos/${idfecha}/${orden}`);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const toggleAusenciaEquipo = async (
  idfecha: number,
  idequipo: number,
  ausente: boolean
): Promise<void> => {
  try {
    await API.put(`/api/planillas-pago/${idfecha}/ausencia`, {
      idequipo,
      ausente,
    });
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updatePagoFechaEquipo = async (
  idfecha: number,
  idequipo: number,
  importe: number
): Promise<void> => {
  try {
    await API.put(`/api/planillas-pago/${idfecha}/pago-fecha`, {
      idequipo,
      importe,
    });
  } catch (error) {
    return handleAxiosError(error);
  }
};
