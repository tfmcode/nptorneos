import { Request, Response } from "express";
import {
  getAllEquipos,
  getEquipoById,
  createEquipo,
  updateEquipo,
  deleteEquipo,
  getEquiposByJugador,
} from "../models/equiposModel";

export const getEquipos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : "";

    const { equipos, total } = await getAllEquipos(page, limit, searchTerm);
    res.status(200).json({ equipos, total, page, limit });
  } catch (error) {
    console.error("❌ Error al obtener equipos:", error);
    res.status(500).json({ message: "Error al obtener equipos.", error });
  }
};

export const getEquipoByIdController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const equipo = await getEquipoById(id);

    if (!equipo) {
      return res.status(404).json({ message: "Equipo no encontrado." });
    }

    res.status(200).json(equipo);
  } catch (error) {
    console.error("❌ Error al obtener equipo:", error);
    res.status(500).json({ message: "Error al obtener equipo.", error });
  }
};

// Obtener todos los equipos de un jugador
export const getEquiposByJugadorController = async (
  req: Request,
  res: Response
) => {
  try {
    const idjugador = Number(req.params.idjugador);
    const equipos = await getEquiposByJugador(idjugador);
    if (!equipos || equipos.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron equipos para este jugador." });
    }

    res.status(200).json(equipos);
  } catch (error) {
    console.error("❌ Error al obtener equipos del jugador:", error);
    res
      .status(500)
      .json({ message: "Error al obtener equipos del jugador.", error });
  }
};

export const createEquipoController = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const nuevoEquipo = await createEquipo(data);

    return res.status(201).json({
      message: "Equipo creado exitosamente.",
      equipo: nuevoEquipo,
    });
  } catch (error) {
    console.error("❌ Error al crear equipo:", error);
    return res.status(500).json({ message: "Error al crear equipo.", error });
  }
};

export const updateEquipoController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const equipoActualizado = await updateEquipo(id, req.body);

    if (!equipoActualizado) {
      return res.status(404).json({ message: "Equipo no encontrado." });
    }

    return res.status(200).json({
      message: "Equipo actualizado exitosamente.",
      equipo: equipoActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar equipo:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar el equipo.", error });
  }
};

export const deleteEquipoController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteEquipo(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Equipo no encontrado o ya dado de baja." });
    }

    return res.status(200).json({
      message: "Equipo eliminado correctamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar equipo:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar el equipo.", error });
  }
};
