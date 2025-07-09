import { Request, Response } from "express";
import {
  getSancionById,
  getSanciones,
  createSancion,
  updateSancion,
  deleteSancion,
} from "../models/sancionesModel";

export const getSancionesController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = (req.query.searchTerm as string) || "";
    const startDate = (req.query.startDate as string) || "1900-01-01";
    const endDate = (req.query.endDate as string) || "2099-12-31";

    const result = await getSanciones({
      page,
      limit,
      searchTerm,
      startDate,
      endDate,
    });

    res.status(200).json({
      sanciones: result.sanciones,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (error) {
    console.error("❌ Error al obtener las sanciones:", error);
    res.status(500).json({ message: "Error al obtener las sanciones.", error });
  }
};

export const getSancion = async (req: Request, res: Response) => {
  try {
    const sancion = await getSancionById(Number(req.params.id));

    if (!sancion) {
      return res.status(404).json({ message: "Sanción no encontrada." });
    }

    res.status(200).json(sancion);
  } catch (error) {
    console.error("❌ Error al obtener sanción:", error);
    res.status(500).json({ message: "Error al obtener la sanción.", error });
  }
};

export const createSancionController = async (req: Request, res: Response) => {
  try {
    const sancion = req.body;

    // Asegurarse de que idusuario esté presente
    if (!sancion.idusuario) {
      return res.status(400).json({ message: "El idusuario es requerido." });
    }

    const newSancion = await createSancion(sancion);

    return res.status(201).json({
      message: "Sanción creada exitosamente.",
      sancion: newSancion,
    });
  } catch (error) {
    console.error("❌ Error al crear sanción:", error);
    return res.status(500).json({ message: "Error al crear sanción.", error });
  }
};

export const updateSancionController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const sancionActualizada = await updateSancion(id, req.body);

    if (!sancionActualizada) {
      return res.status(404).json({ message: "Sanción no encontrada." });
    }

    return res.status(200).json({
      message: "Sanción actualizada exitosamente.",
      sancion: sancionActualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar sanción:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar la sanción.", error });
  }
};

export const deleteSancionController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteSancion(id);

    if (!deleted) {
      return res.status(404).json({ message: "Sanción no encontrada." });
    }

    return res.status(200).json({
      message: "Sanción eliminada exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar sanción:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar la sanción.", error });
  }
};
