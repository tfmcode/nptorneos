// Backend/src/controllers/equiposJugadoresController.ts
import { Request, Response } from "express";
import {
  getEquipoJugadorById,
  getJugadoresByEquipo,
  createEquipoJugador,
  updateEquipoJugador,
  deleteEquipoJugador,
} from "../models/equiposJugadoresModel";

// Obtener todos los jugadores de un equipo
export const getJugadoresByEquipoController = async (
  req: Request,
  res: Response
) => {
  try {
    const idequipo = Number(req.params.idequipo);
    const jugadores = await getJugadoresByEquipo(idequipo);

    if (!jugadores || jugadores.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron jugadores para este equipo." });
    }

    res.status(200).json(jugadores);
  } catch (error) {
    console.error("❌ Error al obtener jugadores del equipo:", error);
    res
      .status(500)
      .json({ message: "Error al obtener jugadores del equipo.", error });
  }
};

// Obtener un jugador de equipo por ID
export const getEquipoJugadorController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const jugador = await getEquipoJugadorById(id);

    if (!jugador) {
      return res
        .status(404)
        .json({ message: "Jugador del equipo no encontrado." });
    }

    res.status(200).json(jugador);
  } catch (error) {
    console.error("❌ Error al obtener jugador del equipo:", error);
    res
      .status(500)
      .json({ message: "Error al obtener jugador del equipo.", error });
  }
};

// Crear jugador en el equipo
export const createEquipoJugadorController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = req.body;

    if (!data.idusuario) {
      return res.status(400).json({ message: "El idusuario es requerido." });
    }

    if (!data.idjugador) {
      return res.status(400).json({ message: "El idjugador es requerido." });
    }

    if (!data.idequipo) {
      return res.status(400).json({ message: "El idequipo es requerido." });
    }

    const nuevoJugador = await createEquipoJugador(data);

    res.status(201).json({
      message: "Jugador agregado al equipo exitosamente.",
      jugador: nuevoJugador,
    });
  } catch (error: any) {
    console.error("❌ Error al agregar jugador al equipo:", error);

    // Si es un error conocido (jugador duplicado), devolver 400
    if (error.message === "El jugador ya está en el equipo.") {
      return res.status(400).json({ message: error.message });
    }

    res
      .status(500)
      .json({ message: "Error al agregar jugador al equipo.", error });
  }
};

// Actualizar jugador del equipo
export const updateEquipoJugadorController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;

    // Validar que el ID sea válido
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    // Asegurar que el idequipo esté presente para las validaciones de capitán/subcapitán
    if (!data.idequipo) {
      const jugadorActual = await getEquipoJugadorById(id);
      if (jugadorActual) {
        data.idequipo = jugadorActual.idequipo;
      }
    }

    const jugadorActualizado = await updateEquipoJugador(id, data);

    if (!jugadorActualizado) {
      return res
        .status(404)
        .json({ message: "Jugador del equipo no encontrado." });
    }

    res.status(200).json({
      message: "Jugador del equipo actualizado exitosamente.",
      jugador: jugadorActualizado,
    });
  } catch (error: any) {
    console.error("❌ Error al actualizar jugador del equipo:", error);

    if (error.message === "ID es requerido para actualizar.") {
      return res.status(400).json({ message: error.message });
    }

    res
      .status(500)
      .json({ message: "Error al actualizar jugador del equipo.", error });
  }
};

// Eliminar jugador del equipo (soft delete)
export const deleteEquipoJugadorController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    // Validar que el ID sea válido
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "ID inválido para eliminar." });
    }

    const eliminado = await deleteEquipoJugador(id);

    if (!eliminado) {
      return res
        .status(404)
        .json({ message: "Jugador del equipo no encontrado." });
    }

    res
      .status(200)
      .json({ message: "Jugador eliminado del equipo exitosamente." });
  } catch (error: any) {
    console.error("❌ Error al eliminar jugador del equipo:", error);

    if (error.message === "ID es requerido para eliminar.") {
      return res.status(400).json({ message: error.message });
    }

    res
      .status(500)
      .json({ message: "Error al eliminar jugador del equipo.", error });
  }
};
