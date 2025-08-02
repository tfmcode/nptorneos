import { Request, Response } from "express";
import {
  getAllInscripciones,
  getInscripcionById,
  createInscripcion,
  updateInscripcion,
  deleteInscripcion,
  updateEquipoAsoc,
  procesarEquipo,
} from "../models/inscripcionesModel";

export const getInscripciones = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : "";

    const { inscripciones, total } = await getAllInscripciones(
      page,
      limit,
      searchTerm
    );
    res.status(200).json({ inscripciones, total, page, limit });
  } catch (error) {
    console.error("❌ Error al obtener las inscripciones:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las inscripciones.", error });
  }
};

export const getInscripcion = async (req: Request, res: Response) => {
  try {
    const inscripcion = await getInscripcionById(Number(req.params.id));

    if (!inscripcion) {
      return res.status(404).json({ message: "Inscripción no encontrada." });
    }

    res.status(200).json(inscripcion);
  } catch (error) {
    console.error("❌ Error al obtener inscripción:", error);
    res
      .status(500)
      .json({ message: "Error al obtener la inscripción.", error });
  }
};

export const procesarEquipoController = async (req: Request, res: Response) => {
  try {
    const { inscripcion, jugadores } = req.body;
    const { inscripcion: inscripcionResult, jugadores: jugadoresResult } =
      await procesarEquipo(inscripcion, jugadores);
    res.status(200).json({
      message: "Equipo procesado exitosamente.",
      inscripcion: inscripcionResult,
      jugadores: jugadoresResult,
    });
  } catch (error) {
    console.error("❌ Error al procesar equipo:", error);
    res.status(500).json({ message: "Error al procesar equipo.", error });
  }
};

export const createInscripcionController = async (
  req: Request,
  res: Response
) => {
  try {
    const inscripcion = req.body;

    if (!inscripcion.email || !inscripcion.equipo || !inscripcion.idtorneo) {
      return res.status(400).json({
        message: "Los campos email, equipo e idtorneo son obligatorios.",
      });
    }

    const newInscripcion = await createInscripcion(inscripcion);

    return res.status(201).json({
      message: "Inscripción creada exitosamente.",
      inscripcion: newInscripcion,
    });
  } catch (error) {
    console.error("❌ Error al crear inscripción:", error);
    return res
      .status(500)
      .json({ message: "Error al crear inscripción.", error });
  }
};

export const updateEquipoAsocController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const { idequipoasoc } = req.body;
    const inscripcionActualizada = await updateEquipoAsoc(id, idequipoasoc);

    if (!inscripcionActualizada) {
      return res.status(404).json({ message: "Inscripción no encontrada." });
    }

    return res.status(200).json({
      message: "Equipo asociado actualizado exitosamente.",
      inscripcion: inscripcionActualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar equipo asociado:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar equipo asociado.", error });
  }
};

export const updateInscripcionController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const inscripcionActualizada = await updateInscripcion(id, req.body);

    if (!inscripcionActualizada) {
      return res.status(404).json({ message: "Inscripción no encontrada." });
    }

    return res.status(200).json({
      message: "Inscripción actualizada exitosamente.",
      inscripcion: inscripcionActualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar inscripción:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar la inscripción.", error });
  }
};

export const deleteInscripcionController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteInscripcion(id);

    if (!deleted) {
      return res.status(404).json({ message: "Inscripción no encontrada." });
    }

    return res.status(200).json({
      message: "Inscripción eliminada exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar inscripción:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar la inscripción.", error });
  }
};
