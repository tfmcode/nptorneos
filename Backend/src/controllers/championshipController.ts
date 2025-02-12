import { Request, Response } from "express";
import mongoose from "mongoose";
import { Championship } from "../models/championshipModel";

// 📌 Crear un campeonato (sin torneos, estos se asociarán después)
export const createChampionship = async (req: Request, res: Response) => {
  try {
    const { name, sport, enabled } = req.body;

    if (!name || !sport) {
      return res.status(400).json({
        message: "Todos los campos obligatorios deben ser llenados.",
      });
    }

    // Crear el campeonato sin torneos asociados aún
    const newChampionship = new Championship({
      name,
      sport,
      enabled: enabled ?? true, // Si no se envía, por defecto `true`
      tournaments: [], // ✅ Inicialmente sin torneos
    });

    await newChampionship.save();

    return res.status(201).json({
      message: "Campeonato creado exitosamente.",
      championship: newChampionship,
    });
  } catch (error) {
    console.error("Error en createChampionship:", error);
    return res
      .status(500)
      .json({ message: "Error al crear campeonato.", error });
  }
};

// 📌 Obtener todos los campeonatos con sus torneos asociados
export const getChampionships = async (req: Request, res: Response) => {
  try {
    const championships = await Championship.find().populate("tournaments");

    return res.status(200).json(championships);
  } catch (error) {
    console.error("Error en getChampionships:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener campeonatos.", error });
  }
};

// 📌 Asociar un torneo a un campeonato existente
export const addTournamentToChampionship = async (
  req: Request,
  res: Response
) => {
  try {
    const { championshipId, tournamentId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(championshipId) ||
      !mongoose.Types.ObjectId.isValid(tournamentId)
    ) {
      return res
        .status(400)
        .json({ message: "ID de campeonato o torneo inválido." });
    }

    const championship = await Championship.findById(championshipId);

    if (!championship) {
      return res.status(404).json({ message: "Campeonato no encontrado." });
    }

    // Agregar torneo solo si no está ya asociado
    if (!championship.tournaments.includes(tournamentId)) {
      championship.tournaments.push(tournamentId);
      await championship.save();
    }

    return res.status(200).json({
      message: "Torneo agregado al campeonato exitosamente.",
      championship,
    });
  } catch (error) {
    console.error("Error en addTournamentToChampionship:", error);
    return res
      .status(500)
      .json({ message: "Error al agregar torneo al campeonato.", error });
  }
};

// 📌 Actualizar un campeonato (sin tocar torneos, estos se gestionan aparte)
export const updateChampionship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sport, enabled } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    if (!name || !sport) {
      return res.status(400).json({
        message: "Todos los campos obligatorios deben ser llenados.",
      });
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
      message: "Campeonato actualizado exitosamente.",
      championship: updatedChampionship,
    });
  } catch (error) {
    console.error("Error en updateChampionship:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar campeonato.", error });
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
    console.error("Error en deleteChampionship:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar campeonato.", error });
  }
};
