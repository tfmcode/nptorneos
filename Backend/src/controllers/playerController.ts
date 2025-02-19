import { Request, Response } from "express";
import mongoose from "mongoose";
import { Player, IPlayer } from "../models/playerModel";

/**
 * 📌 Crear un nuevo jugador
 */
export const createPlayer = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, document, birthday, ...optionalFields } =
      req.body;

    if (!firstName || !lastName || !document || !birthday) {
      return res
        .status(400)
        .json({ message: "Los campos obligatorios deben completarse." });
    }

    const existingPlayer = await Player.findOne({ document }).lean();
    if (existingPlayer) {
      return res
        .status(400)
        .json({ message: "Ya existe un jugador con este documento." });
    }

    const newPlayer = new Player({
      firstName,
      lastName,
      document,
      birthday,
      ...optionalFields,
    });

    await newPlayer.save();

    return res.status(201).json({
      message: "Jugador creado exitosamente.",
      player: newPlayer,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al crear jugador.", error });
  }
};

/**
 * 📌 Obtener jugadores con paginación y búsqueda mejorada
 */
// 🔥 Obtener jugadores con paginación y búsqueda
export const getPlayers = async (req: Request, res: Response) => {
  try {
    let { name = "", document = "", page = "1", limit = "10" } = req.query; // 🔥 Limitamos la carga a 10 jugadores por defecto

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const query: any = {};

    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: "i" } },
        { lastName: { $regex: name, $options: "i" } },
      ];
    }

    if (document) {
      query.document = { $regex: document, $options: "i" };
    }

    const totalPlayers = await Player.countDocuments(query); // 🔥 Obtener el total de jugadores

    const players = await Player.find(query)
      .sort({ createdAt: -1 }) // 🔥 Ordenamos por fecha de creación (los más nuevos primero)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    res
      .status(200)
      .json({ players, totalPlayers, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error("Error en getPlayers:", error);
    res.status(500).json({ message: "Error al obtener jugadores.", error });
  }
};

/**
 * 📌 Obtener un solo jugador por ID
 */
export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const player = await Player.findById(id).lean();
    if (!player) {
      return res.status(404).json({ message: "Jugador no encontrado." });
    }

    return res.status(200).json(player);
  } catch (error) {
    console.error("Error en getPlayerById:", error);
    res.status(500).json({ message: "Error al obtener el jugador.", error });
  }
};

/**
 * 📌 Actualizar jugador
 */
export const updatePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, document, birthday, ...optionalFields } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    if (!firstName || !lastName || !document || !birthday) {
      return res
        .status(400)
        .json({ message: "Todos los campos obligatorios deben ser llenados." });
    }

    const updateFields: Partial<IPlayer> = {
      firstName,
      lastName,
      document,
      birthday,
      ...optionalFields, // 🔥 Mantenemos los valores opcionales sin sobrescribir en `undefined`
    };

    const updatedPlayer = await Player.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updatedPlayer) {
      return res.status(404).json({ message: "Jugador no encontrado." });
    }

    return res.status(200).json({
      message: "Jugador actualizado exitosamente.",
      player: updatedPlayer,
    });
  } catch (error) {
    console.error("Error en updatePlayer:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar el jugador.", error });
  }
};

/**
 * 📌 Eliminar jugador
 */
export const deletePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const deletedPlayer = await Player.findByIdAndDelete(id);

    if (!deletedPlayer) {
      return res.status(404).json({ message: "Jugador no encontrado." });
    }

    return res.status(200).json({ message: "Jugador eliminado exitosamente." });
  } catch (error) {
    console.error("Error en deletePlayer:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar el jugador.", error });
  }
};
