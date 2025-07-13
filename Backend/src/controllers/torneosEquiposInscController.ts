import { Request, Response } from "express";
import {
  getAllTorneosEquiposInsc,
  getTorneosEquiposInscById,
  createTorneosEquiposInsc,
  updateTorneosEquiposInsc,
  deleteTorneosEquiposInsc,
  getTorneosEquiposInscByTorneo,
  getTorneosEquiposInscByEquipo,
} from "../models/torneosEquiposInscModel";

export const getTorneosEquiposInscController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : "";

    const { inscripciones, total } = await getAllTorneosEquiposInsc(
      page,
      limit,
      searchTerm
    );
    res.status(200).json({ inscripciones, total, page, limit });
  } catch (error) {
    console.error(
      "❌ Error al obtener inscripciones de torneos equipos:",
      error
    );
    res.status(500).json({
      message: "Error al obtener inscripciones de torneos equipos.",
      error,
    });
  }
};

export const getTorneosEquiposInscByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const inscripcion = await getTorneosEquiposInscById(id);

    if (!inscripcion) {
      return res.status(404).json({ message: "Inscripción no encontrada." });
    }

    res.status(200).json(inscripcion);
  } catch (error) {
    console.error("❌ Error al obtener inscripción:", error);
    res.status(500).json({ message: "Error al obtener inscripción.", error });
  }
};

export const getTorneosEquiposInscByTorneoController = async (
  req: Request,
  res: Response
) => {
  try {
    const idtorneo = Number(req.params.idtorneo);
    const inscripciones = await getTorneosEquiposInscByTorneo(idtorneo);

    if (!inscripciones || inscripciones.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron inscripciones para este torneo." });
    }

    res.status(200).json(inscripciones);
  } catch (error) {
    console.error("❌ Error al obtener inscripciones del torneo:", error);
    res
      .status(500)
      .json({ message: "Error al obtener inscripciones del torneo.", error });
  }
};

export const getTorneosEquiposInscByEquipoController = async (
  req: Request,
  res: Response
) => {
  try {
    const idequipo = Number(req.params.idequipo);
    const inscripciones = await getTorneosEquiposInscByEquipo(idequipo);

    if (!inscripciones || inscripciones.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron inscripciones para este equipo." });
    }

    res.status(200).json(inscripciones);
  } catch (error) {
    console.error("❌ Error al obtener inscripciones del equipo:", error);
    res
      .status(500)
      .json({ message: "Error al obtener inscripciones del equipo.", error });
  }
};

export const createTorneosEquiposInscController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = req.body;
    const nuevaInscripcion = await createTorneosEquiposInsc(data);

    return res.status(201).json({
      message: "Inscripción creada exitosamente.",
      inscripcion: nuevaInscripcion,
    });
  } catch (error) {
    console.error("❌ Error al crear inscripción:", error);
    return res
      .status(500)
      .json({ message: "Error al crear inscripción.", error });
  }
};

export const updateTorneosEquiposInscController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const inscripcionActualizada = await updateTorneosEquiposInsc(id, req.body);

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

export const deleteTorneosEquiposInscController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteTorneosEquiposInsc(id);

    if (!deleted) {
      return res.status(404).json({ message: "Inscripción no encontrada." });
    }

    return res.status(200).json({
      message: "Inscripción eliminada correctamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar inscripción:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar la inscripción.", error });
  }
};
