import { Request, Response } from "express";
import {
  getAllInscripcionesJugadores,
  getInscripcionesJugadoresByInscripcion,
  getInscripcionJugadorById,
  createInscripcionJugador,
  updateInscripcionJugador,
  deleteInscripcionJugador,
} from "../models/inscripcionesJugadoresModel";

export const getInscripcionesJugadores = async (
  req: Request,
  res: Response
) => {
  try {
    const inscripcionesJugadores = await getAllInscripcionesJugadores();
    res.status(200).json(inscripcionesJugadores);
  } catch (error) {
    console.error("❌ Error al obtener los jugadores de inscripciones:", error);
    res.status(500).json({
      message: "Error al obtener los jugadores de inscripciones.",
      error,
    });
  }
};

export const getInscripcionesJugadoresByInscripcionId = async (
  req: Request,
  res: Response
) => {
  try {
    const idinscrip = Number(req.params.idinscrip);
    const jugadores = await getInscripcionesJugadoresByInscripcion(idinscrip);
    res.status(200).json(jugadores);
  } catch (error) {
    console.error("❌ Error al obtener jugadores por inscripción:", error);
    res.status(500).json({
      message: "Error al obtener los jugadores de la inscripción.",
      error,
    });
  }
};

export const getInscripcionJugador = async (req: Request, res: Response) => {
  try {
    const inscripcionJugador = await getInscripcionJugadorById(
      Number(req.params.id)
    );

    if (!inscripcionJugador) {
      return res
        .status(404)
        .json({ message: "Jugador de inscripción no encontrado." });
    }

    res.status(200).json(inscripcionJugador);
  } catch (error) {
    console.error("❌ Error al obtener jugador de inscripción:", error);
    res
      .status(500)
      .json({ message: "Error al obtener el jugador de inscripción.", error });
  }
};

export const createInscripcionJugadorController = async (
  req: Request,
  res: Response
) => {
  try {
    const inscripcionJugador = req.body;

    if (
      !inscripcionJugador.idinscrip ||
      !inscripcionJugador.apellido ||
      !inscripcionJugador.nombres
    ) {
      return res.status(400).json({
        message: "Los campos idinscrip, apellido y nombres son obligatorios.",
      });
    }

    const newInscripcionJugador = await createInscripcionJugador(
      inscripcionJugador
    );

    return res.status(201).json({
      message: "Jugador de inscripción creado exitosamente.",
      inscripcionJugador: newInscripcionJugador,
    });
  } catch (error) {
    console.error("❌ Error al crear jugador de inscripción:", error);
    return res
      .status(500)
      .json({ message: "Error al crear jugador de inscripción.", error });
  }
};

export const updateInscripcionJugadorController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const inscripcionJugadorActualizado = await updateInscripcionJugador(
      id,
      req.body
    );

    if (!inscripcionJugadorActualizado) {
      return res
        .status(404)
        .json({ message: "Jugador de inscripción no encontrado." });
    }

    return res.status(200).json({
      message: "Jugador de inscripción actualizado exitosamente.",
      inscripcionJugador: inscripcionJugadorActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar jugador de inscripción:", error);
    return res.status(500).json({
      message: "Error al actualizar el jugador de inscripción.",
      error,
    });
  }
};

export const deleteInscripcionJugadorController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteInscripcionJugador(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Jugador de inscripción no encontrado." });
    }

    return res.status(200).json({
      message: "Jugador de inscripción eliminado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar jugador de inscripción:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar el jugador de inscripción.", error });
  }
};
