import { Request, Response } from "express";
import {
  getAllJugadores,
  getJugadorById,
  createJugador,
  updateJugador,
  deleteJugador,
} from "../models/jugadoresModel";

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

// ✅ MANEJO ESPECÍFICO DE ERROR DE DOCUMENTO DUPLICADO
const handleDatabaseError = (error: any) => {
  // PostgreSQL error code para unique constraint violation
  if (error.code === "23505") {
    if (error.constraint === "uk_jugadores_docnro") {
      return {
        status: 409, // Conflict
        message: "El número de documento ya existe en el sistema",
        type: "DUPLICATE_DOCUMENT",
      };
    }
  }

  // Error genérico de base de datos
  return {
    status: 500,
    message: "Error interno del servidor",
    type: "DATABASE_ERROR",
  };
};

export const createJugadorController = async (req: Request, res: Response) => {
  try {
    const newJugador = await createJugador(req.body);
    res
      .status(201)
      .json({ message: "Jugador creado exitosamente.", jugador: newJugador });
  } catch (error: any) {
    console.error("❌ Error en createJugadorController:", error);

    const dbError = handleDatabaseError(error);
    res.status(dbError.status).json({
      message: dbError.message,
      type: dbError.type,
      error: dbError.type === "DATABASE_ERROR" ? error : undefined,
    });
  }
};

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
  } catch (error: any) {
    console.error("❌ Error en updateJugadorController:", error);

    const dbError = handleDatabaseError(error);
    res.status(dbError.status).json({
      message: dbError.message,
      type: dbError.type,
      error: dbError.type === "DATABASE_ERROR" ? error : undefined,
    });
  }
};

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
