import { Request, Response } from "express";
import {
  getAllJugadores,
  getJugadorById,
  createJugador,
  updateJugador,
  deleteJugador,
} from "../models/jugadoresModel";

// 🔍 Obtener jugadores con paginación (Corregido)
export const getJugadores = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : "";

    const { jugadores, total } = await getAllJugadores(page, limit, searchTerm);

    res.status(200).json({ jugadores, total, page, limit });
  } catch (error) {
    console.error("❌ Error en getJugadores:", error);
    res.status(500).json({ message: "Error al obtener jugadores.", error });
  }
};

// 🔍 Obtener jugador por ID
export const getJugador = async (req: Request, res: Response) => {
  try {
    const jugador = await getJugadorById(Number(req.params.id));
    if (!jugador) {
      return res.status(404).json({ message: "Jugador no encontrado." });
    }
    res.status(200).json(jugador);
  } catch (error) {
    console.error("❌ Error en getJugador:", error);
    res.status(500).json({ message: "Error al obtener jugador.", error });
  }
};

// 🆕 Crear un jugador
export const createJugadorController = async (req: Request, res: Response) => {
  try {
    const newJugador = await createJugador(req.body);
    res
      .status(201)
      .json({ message: "Jugador creado exitosamente.", jugador: newJugador });
  } catch (error) {
    console.error("❌ Error en createJugadorController:", error);
    res.status(500).json({ message: "Error al crear jugador.", error });
  }
};

// 🔄 Actualizar jugador (Corregido)
export const updateJugadorController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "ID de jugador no válido." });
    }

    const jugadorActualizado = await updateJugador(id, req.body);
    if (!jugadorActualizado) {
      return res.status(404).json({ message: "Jugador no encontrado." });
    }
    res
      .status(200)
      .json({ message: "Jugador actualizado.", jugador: jugadorActualizado });
  } catch (error) {
    console.error("❌ Error en updateJugadorController:", error);
    res.status(500).json({ message: "Error al actualizar el jugador.", error });
  }
};

// ❌ Soft delete (marcar jugador como dado de baja)
export const deleteJugadorController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteJugador(id);
    if (!deleted) {
      return res.status(404).json({ message: "Jugador no encontrado." });
    }
    res.status(200).json({ message: "Jugador eliminado exitosamente." });
  } catch (error) {
    console.error("❌ Error en deleteJugadorController:", error);
    res.status(500).json({ message: "Error al eliminar el jugador.", error });
  }
};
