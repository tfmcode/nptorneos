import { Request, Response } from "express";
import mongoose from "mongoose";
import { Championship } from "../models/championshipModel";

// 📌 Crear un campeonato
export const createChampionship = async (req: Request, res: Response) => {
  try {
    const { name, sport } = req.body;

    if (!name || !sport) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos." });
    }

    const existingChampionship = await Championship.findOne({ name });
    if (existingChampionship) {
      return res.status(400).json({ message: "El campeonato ya existe." });
    }

    const newChampionship = new Championship({ name, sport });
    await newChampionship.save();

    return res.status(201).json({
      message: "Campeonato creado exitosamente.",
      championship: newChampionship,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al crear el campeonato.", error });
  }
};

// 📌 Obtener todos los campeonatos
export const getChampionships = async (req: Request, res: Response) => {
  try {
    const championships = await Championship.find();
    return res.status(200).json(championships);
  } catch (error) {
    console.error("Error en getChampionships:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener campeonatos.", error });
  }
};

// 📌 Obtener un campeonato por ID
export const getChampionshipById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const championship = await Championship.findById(id).populate(
      "tournaments"
    );

    if (!championship) {
      return res.status(404).json({ message: "Campeonato no encontrado." });
    }

    return res.status(200).json(championship);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener el campeonato.", error });
  }
};

// 📌 Actualizar un campeonato
export const updateChampionship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sport, enabled } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const updatedChampionship = await Championship.findByIdAndUpdate(
      id,
      { name, sport, enabled },
      { new: true }
    );

    if (!updatedChampionship) {
      return res.status(404).json({ message: "Campeonato no encontrado." });
    }

    return res.status(200).json({
      message: "Campeonato actualizado.",
      championship: updatedChampionship,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al actualizar el campeonato.", error });
  }
};

// 📌 Eliminar un campeonato
export const deleteChampionship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const deletedChampionship = await Championship.findByIdAndDelete(id);

    if (!deletedChampionship) {
      return res.status(404).json({ message: "Campeonato no encontrado." });
    }

    return res
      .status(200)
      .json({ message: "Campeonato eliminado exitosamente." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al eliminar el campeonato.", error });
  }
};
