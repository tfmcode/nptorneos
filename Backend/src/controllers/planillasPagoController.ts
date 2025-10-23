import { Request, Response } from "express";
import * as planillasModel from "../models/planillasPagoModel";
import { PlanillasFiltros } from "../types/planillasPago";

// ========================================
// LISTADO Y FILTROS
// ========================================

export const getPlanillasController = async (req: Request, res: Response) => {
  try {
    const filtros: PlanillasFiltros = {
      idtorneo: req.query.idtorneo ? Number(req.query.idtorneo) : undefined,
      fecha_desde: req.query.fecha_desde as string,
      fecha_hasta: req.query.fecha_hasta as string,
      idsede: req.query.idsede ? Number(req.query.idsede) : undefined,
      estado: req.query.estado as "abierta" | "cerrada" | "contabilizada",
    };

    const planillas = await planillasModel.getPlanillasByFiltros(filtros);
    return res.status(200).json(planillas);
  } catch (error) {
    console.error("❌ Error al obtener planillas:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener planillas.", error });
  }
};

// ========================================
// OBTENER PLANILLA COMPLETA
// ========================================

export const getPlanillaCompletaController = async (
  req: Request,
  res: Response
) => {
  try {
    const idfecha = Number(req.params.idfecha);

    if (isNaN(idfecha)) {
      return res.status(400).json({ message: "ID de fecha inválido." });
    }

    const planillaCompleta = await planillasModel.getPlanillaCompleta(idfecha);

    if (!planillaCompleta) {
      return res.status(404).json({ message: "Planilla no encontrada." });
    }

    return res.status(200).json(planillaCompleta);
  } catch (error) {
    console.error("❌ Error al obtener planilla completa:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener planilla completa.", error });
  }
};

// ========================================
// CREAR PLANILLA
// ========================================

export const createPlanillaController = async (req: Request, res: Response) => {
  try {
    const {
      idfecha,
      fecha,
      idsede,
      idsubsede,
      idtorneo,
      codfecha,
      idprofesor,
      idturno,
      observ,
    } = req.body;

    // Validaciones
    if (!idfecha || !fecha || !idsede || !idtorneo) {
      return res.status(400).json({
        message: "Campos obligatorios: idfecha, fecha, idsede, idtorneo",
      });
    }

    // Verificar si ya existe planilla para ese idfecha
    const existente = await planillasModel.getPlanillaByIdFecha(idfecha);
    if (existente) {
      return res.status(400).json({
        message: "Ya existe una planilla para este partido/fecha.",
      });
    }

    const nuevaPlanilla = await planillasModel.createPlanilla({
      idfecha,
      fecha,
      idsede,
      idsubsede,
      idtorneo,
      codfecha,
      idprofesor,
      idturno,
      observ,
    });

    return res.status(201).json({
      message: "Planilla creada exitosamente.",
      planilla: nuevaPlanilla,
    });
  } catch (error) {
    console.error("❌ Error al crear planilla:", error);
    return res.status(500).json({ message: "Error al crear planilla.", error });
  }
};

// ========================================
// ACTUALIZAR PLANILLA
// ========================================

export const updatePlanillaController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const datosActualizados = req.body;

    const planillaActualizada = await planillasModel.updatePlanilla(
      id,
      datosActualizados
    );

    if (!planillaActualizada) {
      return res.status(404).json({ message: "Planilla no encontrada." });
    }

    return res.status(200).json({
      message: "Planilla actualizada exitosamente.",
      planilla: planillaActualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar planilla:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar planilla.", error });
  }
};

// ========================================
// CERRAR PLANILLA
// ========================================

export const cerrarPlanillaController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const planillaCerrada = await planillasModel.cerrarPlanilla(id);

    if (!planillaCerrada) {
      return res.status(404).json({ message: "Planilla no encontrada." });
    }

    return res.status(200).json({
      message: "Planilla cerrada exitosamente.",
      planilla: planillaCerrada,
    });
  } catch (error) {
    console.error("❌ Error al cerrar planilla:", error);
    return res
      .status(500)
      .json({ message: "Error al cerrar planilla.", error });
  }
};

// ========================================
// CONTABILIZAR PLANILLA
// ========================================

export const contabilizarPlanillaController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const idusuario = req.body.idusuario || 1; // Debería venir del middleware de auth

    const planillaContabilizada = await planillasModel.contabilizarPlanilla(
      id,
      idusuario
    );

    if (!planillaContabilizada) {
      return res.status(404).json({
        message: "Planilla no encontrada o no está cerrada.",
      });
    }

    return res.status(200).json({
      message: "Planilla contabilizada exitosamente.",
      planilla: planillaContabilizada,
    });
  } catch (error) {
    console.error("❌ Error al contabilizar planilla:", error);
    return res
      .status(500)
      .json({ message: "Error al contabilizar planilla.", error });
  }
};

// ========================================
// ELIMINAR PLANILLA
// ========================================

export const deletePlanillaController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await planillasModel.deletePlanilla(id);

    if (!deleted) {
      return res.status(404).json({ message: "Planilla no encontrada." });
    }

    return res.status(200).json({
      message: "Planilla eliminada exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar planilla:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar planilla.", error });
  }
};

// ========================================
// EQUIPOS
// ========================================

export const saveEquipoController = async (req: Request, res: Response) => {
  try {
    const equipoGuardado = await planillasModel.saveEquipoPlanilla(req.body);
    return res.status(200).json({
      message: "Equipo guardado exitosamente.",
      equipo: equipoGuardado,
    });
  } catch (error) {
    console.error("❌ Error al guardar equipo:", error);
    return res.status(500).json({ message: "Error al guardar equipo.", error });
  }
};

export const deleteEquipoController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteEquipoPlanilla(
      Number(idfecha),
      Number(orden)
    );

    if (!deleted) {
      return res.status(404).json({ message: "Equipo no encontrado." });
    }

    return res.status(200).json({ message: "Equipo eliminado exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar equipo:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar equipo.", error });
  }
};

// ========================================
// ÁRBITROS
// ========================================

export const saveArbitroController = async (req: Request, res: Response) => {
  try {
    const arbitroGuardado = await planillasModel.saveArbitroPlanilla(req.body);
    return res.status(200).json({
      message: "Árbitro guardado exitosamente.",
      arbitro: arbitroGuardado,
    });
  } catch (error) {
    console.error("❌ Error al guardar árbitro:", error);
    return res
      .status(500)
      .json({ message: "Error al guardar árbitro.", error });
  }
};

export const deleteArbitroController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteArbitroPlanilla(
      Number(idfecha),
      Number(orden)
    );

    if (!deleted) {
      return res.status(404).json({ message: "Árbitro no encontrado." });
    }

    return res.status(200).json({ message: "Árbitro eliminado exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar árbitro:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar árbitro.", error });
  }
};

// ========================================
// CANCHAS
// ========================================

export const saveCanchaController = async (req: Request, res: Response) => {
  try {
    const canchaGuardada = await planillasModel.saveCanchaPlanilla(req.body);
    return res.status(200).json({
      message: "Cancha guardada exitosamente.",
      cancha: canchaGuardada,
    });
  } catch (error) {
    console.error("❌ Error al guardar cancha:", error);
    return res.status(500).json({ message: "Error al guardar cancha.", error });
  }
};

export const deleteCanchaController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteCanchaPlanilla(
      Number(idfecha),
      Number(orden)
    );

    if (!deleted) {
      return res.status(404).json({ message: "Cancha no encontrada." });
    }

    return res.status(200).json({ message: "Cancha eliminada exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar cancha:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar cancha.", error });
  }
};

// ========================================
// PROFESORES
// ========================================

export const saveProfesorController = async (req: Request, res: Response) => {
  try {
    const profesorGuardado = await planillasModel.saveProfesorPlanilla(
      req.body
    );
    return res.status(200).json({
      message: "Profesor guardado exitosamente.",
      profesor: profesorGuardado,
    });
  } catch (error) {
    console.error("❌ Error al guardar profesor:", error);
    return res
      .status(500)
      .json({ message: "Error al guardar profesor.", error });
  }
};

export const deleteProfesorController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteProfesorPlanilla(
      Number(idfecha),
      Number(orden)
    );

    if (!deleted) {
      return res.status(404).json({ message: "Profesor no encontrado." });
    }

    return res
      .status(200)
      .json({ message: "Profesor eliminado exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar profesor:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar profesor.", error });
  }
};

// ========================================
// SERVICIO MÉDICO
// ========================================

export const saveMedicoController = async (req: Request, res: Response) => {
  try {
    const medicoGuardado = await planillasModel.saveMedicoPlanilla(req.body);
    return res.status(200).json({
      message: "Médico guardado exitosamente.",
      medico: medicoGuardado,
    });
  } catch (error) {
    console.error("❌ Error al guardar médico:", error);
    return res.status(500).json({ message: "Error al guardar médico.", error });
  }
};

export const deleteMedicoController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteMedicoPlanilla(
      Number(idfecha),
      Number(orden)
    );

    if (!deleted) {
      return res.status(404).json({ message: "Médico no encontrado." });
    }

    return res.status(200).json({ message: "Médico eliminado exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar médico:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar médico.", error });
  }
};

// ========================================
// OTROS GASTOS
// ========================================

export const saveOtroGastoController = async (req: Request, res: Response) => {
  try {
    const gastoGuardado = await planillasModel.saveOtroGastoPlanilla(req.body);
    return res.status(200).json({
      message: "Gasto guardado exitosamente.",
      gasto: gastoGuardado,
    });
  } catch (error) {
    console.error("❌ Error al guardar gasto:", error);
    return res.status(500).json({ message: "Error al guardar gasto.", error });
  }
};

export const deleteOtroGastoController = async (
  req: Request,
  res: Response
) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteOtroGastoPlanilla(
      Number(idfecha),
      Number(orden)
    );

    if (!deleted) {
      return res.status(404).json({ message: "Gasto no encontrado." });
    }

    return res.status(200).json({ message: "Gasto eliminado exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar gasto:", error);
    return res.status(500).json({ message: "Error al eliminar gasto.", error });
  }
};
