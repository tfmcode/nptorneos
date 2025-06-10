import { Request, Response } from "express";
import {
  getAllTorneos,
  getTorneoById,
  createTorneo,
  updateTorneo,
  deleteTorneo,
  getTorneosByCampeonato,
} from "../models/torneosModel";

export const getTorneos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : "";
    const idcampeonato = req.query.idcampeonato
      ? Number(req.query.idcampeonato)
      : 0;

    if (idcampeonato !== 0) {
      const torneos = await getTorneosByCampeonato(idcampeonato);
      res.status(200).json(torneos);
    } else {
      const { torneos, total } = await getAllTorneos(page, limit, searchTerm);
      res.status(200).json({ torneos, total, page, limit });
    }
  } catch (error) {
    console.error("❌ Error al obtener los torneos:", error);
    res.status(500).json({ message: "Error al obtener los torneos.", error });
  }
};

export const getTorneo = async (req: Request, res: Response) => {
  try {
    const torneo = await getTorneoById(Number(req.params.id));

    if (!torneo) {
      return res.status(404).json({ message: "Torneo no encontrado." });
    }

    res.status(200).json(torneo);
  } catch (error) {
    console.error("❌ Error al obtener torneo:", error);
    res.status(500).json({ message: "Error al obtener el torneo.", error });
  }
};

export const createTorneoController = async (req: Request, res: Response) => {
  try {
    const torneo = req.body;

    const newTorneo = await createTorneo(torneo);

    return res.status(201).json({
      message: "Torneo creado exitosamente.",
      torneo: newTorneo,
    });
  } catch (error) {
    console.error("❌ Error al crear torneo:", error);
    return res.status(500).json({ message: "Error al crear torneo.", error });
  }
};

export const updateTorneoController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const torneoActualizado = await updateTorneo(id, req.body);

    if (!torneoActualizado) {
      return res.status(404).json({ message: "Torneo no encontrado." });
    }

    return res.status(200).json({
      message: "Torneo actualizado exitosamente.",
      torneo: torneoActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar torneo:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar el torneo.", error });
  }
};

export const deleteTorneoController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteTorneo(id);

    if (!deleted) {
      return res.status(404).json({ message: "Torneo no encontrado." });
    }

    return res.status(200).json({
      message: "Torneo eliminado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar torneo:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar el torneo.", error });
  }
};
