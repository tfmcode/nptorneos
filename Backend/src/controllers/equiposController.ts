import { Request, Response } from "express";
import {
  getAllEquipos,
  getEquipoById,
  createEquipo,
  updateEquipo,
  deleteEquipo,
} from "../models/equiposModel";

export const getEquipos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = String(req.query.searchTerm || "");

    const { equipos, total } = await getAllEquipos(page, limit, searchTerm);
    res.status(200).json({ equipos, total, page, limit });
  } catch (error) {
    console.error("❌ Error al obtener equipos:", error);
    res.status(500).json({ message: "Error al obtener equipos.", error });
  }
};

export const getEquipo = async (req: Request, res: Response) => {
  try {
    const equipo = await getEquipoById(Number(req.params.id));
    if (!equipo)
      return res.status(404).json({ message: "Equipo no encontrado." });
    res.status(200).json(equipo);
  } catch (error) {
    console.error("❌ Error al obtener equipo:", error);
    res.status(500).json({ message: "Error al obtener equipo.", error });
  }
};

export const createEquipoController = async (req: Request, res: Response) => {
  try {
    const newEquipo = await createEquipo(req.body);
    res
      .status(201)
      .json({ message: "Equipo creado exitosamente.", equipo: newEquipo });
  } catch (error) {
    console.error("❌ Error al crear equipo:", error);
    res.status(500).json({ message: "Error al crear equipo.", error });
  }
};

export const updateEquipoController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const equipo = await updateEquipo(id, req.body);
    if (!equipo)
      return res.status(404).json({ message: "Equipo no encontrado." });
    res
      .status(200)
      .json({ message: "Equipo actualizado exitosamente.", equipo });
  } catch (error) {
    console.error("❌ Error al actualizar equipo:", error);
    res.status(500).json({ message: "Error al actualizar equipo.", error });
  }
};

export const deleteEquipoController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteEquipo(Number(req.params.id));
    if (!deleted)
      return res.status(404).json({ message: "Equipo no encontrado." });
    res.status(200).json({ message: "Equipo eliminado exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar equipo:", error);
    res.status(500).json({ message: "Error al eliminar equipo.", error });
  }
};
