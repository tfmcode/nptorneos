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

    const planillaCompleta = await planillasModel.getPlanillaByIdFecha(idfecha);

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
    const { idfecha } = req.body;

    // Validación
    if (!idfecha) {
      return res.status(400).json({
        message: "Campo obligatorio: idfecha",
      });
    }

    // Verificar si ya existe planilla para ese idfecha
    const existente = await planillasModel.getPlanillaByIdFecha(idfecha);
    if (existente) {
      return res.status(400).json({
        message: "Ya existe una planilla para este partido/fecha.",
      });
    }

    const nuevaPlanilla = await planillasModel.createPlanilla(idfecha);

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
// CERRAR PLANILLA
// ========================================

export const cerrarPlanillaController = async (req: Request, res: Response) => {
  try {
    const idfecha = Number(req.params.idfecha);
    const { idprofesor } = req.body;

    if (!idprofesor) {
      return res.status(400).json({
        message: "Se requiere idprofesor para cerrar la planilla.",
      });
    }

    await planillasModel.cerrarPlanilla(idfecha, idprofesor);

    return res.status(200).json({
      message: "Planilla cerrada exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al cerrar planilla:", error);
    return res
      .status(500)
      .json({ message: "Error al cerrar planilla.", error });
  }
};

// ========================================
// CERRAR CAJA (CONTABILIZAR)
// ========================================

export const cerrarCajaController = async (req: Request, res: Response) => {
  try {
    const idfecha = Number(req.params.idfecha);
    const idusuario = req.body.idusuario || 1; // Debería venir del middleware de auth

    await planillasModel.cerrarCaja(idfecha, idusuario);

    return res.status(200).json({
      message: "Caja cerrada (contabilizada) exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al cerrar caja:", error);
    return res.status(500).json({ message: "Error al cerrar caja.", error });
  }
};

// ========================================
// EQUIPOS
// ========================================

export const addEquipoController = async (req: Request, res: Response) => {
  try {
    const equipoGuardado = await planillasModel.addEquipo(req.body);
    return res.status(201).json({
      message: "Equipo agregado exitosamente.",
      equipo: equipoGuardado,
    });
  } catch (error) {
    console.error("❌ Error al agregar equipo:", error);
    return res.status(500).json({ message: "Error al agregar equipo.", error });
  }
};

// ✅ CORREGIDO: Ahora usa (idfecha, orden) en lugar de id
export const updateEquipoController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const equipoActualizado = await planillasModel.updateEquipo(
      Number(idfecha),
      Number(orden),
      req.body
    );
    return res.status(200).json({
      message: "Equipo actualizado exitosamente.",
      equipo: equipoActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar equipo:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar equipo.", error });
  }
};

// ✅ CORREGIDO: Ahora usa (idfecha, orden) en lugar de id
export const deleteEquipoController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteEquipo(
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

export const addArbitroController = async (req: Request, res: Response) => {
  try {
    const arbitroGuardado = await planillasModel.addArbitro(req.body);
    return res.status(201).json({
      message: "Árbitro agregado exitosamente.",
      arbitro: arbitroGuardado,
    });
  } catch (error) {
    console.error("❌ Error al agregar árbitro:", error);
    return res
      .status(500)
      .json({ message: "Error al agregar árbitro.", error });
  }
};

export const updateArbitroController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const arbitroActualizado = await planillasModel.updateArbitro(
      Number(idfecha),
      Number(orden),
      req.body
    );
    return res.status(200).json({
      message: "Árbitro actualizado exitosamente.",
      arbitro: arbitroActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar árbitro:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar árbitro.", error });
  }
};

export const deleteArbitroController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteArbitro(
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

export const addCanchaController = async (req: Request, res: Response) => {
  try {
    const canchaGuardada = await planillasModel.addCancha(req.body);
    return res.status(201).json({
      message: "Cancha agregada exitosamente.",
      cancha: canchaGuardada,
    });
  } catch (error) {
    console.error("❌ Error al agregar cancha:", error);
    return res.status(500).json({ message: "Error al agregar cancha.", error });
  }
};

export const updateCanchaController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const canchaActualizada = await planillasModel.updateCancha(
      Number(idfecha),
      Number(orden),
      req.body
    );
    return res.status(200).json({
      message: "Cancha actualizada exitosamente.",
      cancha: canchaActualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar cancha:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar cancha.", error });
  }
};

export const deleteCanchaController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteCancha(
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

export const addProfesorController = async (req: Request, res: Response) => {
  try {
    const profesorGuardado = await planillasModel.addProfesor(req.body);
    return res.status(201).json({
      message: "Profesor agregado exitosamente.",
      profesor: profesorGuardado,
    });
  } catch (error) {
    console.error("❌ Error al agregar profesor:", error);
    return res
      .status(500)
      .json({ message: "Error al agregar profesor.", error });
  }
};

export const updateProfesorController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const profesorActualizado = await planillasModel.updateProfesor(
      Number(idfecha),
      Number(orden),
      req.body
    );
    return res.status(200).json({
      message: "Profesor actualizado exitosamente.",
      profesor: profesorActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar profesor:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar profesor.", error });
  }
};

export const deleteProfesorController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteProfesor(
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

export const addMedicoController = async (req: Request, res: Response) => {
  try {
    const medicoGuardado = await planillasModel.addMedico(req.body);
    return res.status(201).json({
      message: "Médico agregado exitosamente.",
      medico: medicoGuardado,
    });
  } catch (error) {
    console.error("❌ Error al agregar médico:", error);
    return res.status(500).json({ message: "Error al agregar médico.", error });
  }
};

export const updateMedicoController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const medicoActualizado = await planillasModel.updateMedico(
      Number(idfecha),
      Number(orden),
      req.body
    );
    return res.status(200).json({
      message: "Médico actualizado exitosamente.",
      medico: medicoActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar médico:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar médico.", error });
  }
};

export const deleteMedicoController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteMedico(
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

export const addOtroGastoController = async (req: Request, res: Response) => {
  try {
    const gastoGuardado = await planillasModel.addOtroGasto(req.body);
    return res.status(201).json({
      message: "Gasto agregado exitosamente.",
      gasto: gastoGuardado,
    });
  } catch (error) {
    console.error("❌ Error al agregar gasto:", error);
    return res.status(500).json({ message: "Error al agregar gasto.", error });
  }
};

export const updateOtroGastoController = async (
  req: Request,
  res: Response
) => {
  try {
    const { idfecha, orden } = req.params;
    const gastoActualizado = await planillasModel.updateOtroGasto(
      Number(idfecha),
      Number(orden),
      req.body
    );
    return res.status(200).json({
      message: "Gasto actualizado exitosamente.",
      gasto: gastoActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar gasto:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar gasto.", error });
  }
};

export const deleteOtroGastoController = async (
  req: Request,
  res: Response
) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteOtroGasto(
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
