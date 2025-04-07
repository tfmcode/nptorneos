import { Request, Response } from "express";
import {
  getAllCampeonatos,
  getCampeonatoById,
  createCampeonato,
  updateCampeonato,
  deleteCampeonato,
} from "../models/campeonatosModel";

// 🔍 Obtener todos los campeonatos
export const getCampeonatos = async (req: Request, res: Response) => {
  try {
    const campeonatos = await getAllCampeonatos();
    res.status(200).json(campeonatos);
  } catch (error) {
    console.error("❌ Error al obtener los campeonatos:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los campeonatos.", error });
  }
};

// 🔍 Obtener campeonato por ID
export const getCampeonato = async (req: Request, res: Response) => {
  try {
    const campeonato = await getCampeonatoById(Number(req.params.id));

    if (!campeonato) {
      return res.status(404).json({ message: "Campeonato no encontrado." });
    }

    res.status(200).json(campeonato);
  } catch (error) {
    console.error("❌ Error al obtener campeonato:", error);
    res.status(500).json({ message: "Error al obtener el campeonato.", error });
  }
};

// 🆕 Crear un nuevo campeonato
export const createCampeonatoController = async (
  req: Request,
  res: Response
) => {
  try {
    const campeonato = req.body;

    const newCampeonato = await createCampeonato(campeonato);

    return res.status(201).json({
      message: "Campeonato creado exitosamente.",
      campeonato: newCampeonato,
    });
  } catch (error) {
    console.error("❌ Error al crear campeonato:", error);
    return res
      .status(500)
      .json({ message: "Error al crear campeonato.", error });
  }
};

// 🔄 Actualizar un campeonato
export const updateCampeonatoController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const campeonatoActualizado = await updateCampeonato(id, req.body);

    if (!campeonatoActualizado) {
      return res.status(404).json({ message: "Campeonato no encontrado." });
    }

    return res.status(200).json({
      message: "Campeonato actualizado exitosamente.",
      campeonato: campeonatoActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar campeonato:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar el campeonato.", error });
  }
};

// ❌ Soft delete (marcar campeonato como dado de baja)
export const deleteCampeonatoController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteCampeonato(id);

    if (!deleted) {
      return res.status(404).json({ message: "Campeonato no encontrado." });
    }

    return res.status(200).json({
      message: "Campeonato eliminado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar campeonato:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar el campeonato.", error });
  }
};
