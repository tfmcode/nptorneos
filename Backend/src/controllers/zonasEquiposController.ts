import { Request, Response } from "express";
import {
  getZonaEquipoById,
  getZonasEquiposByTorneo,
  createZonaEquipo,
  updateZonaEquipo,
  deleteZonaEquipo,
} from "../models/zonasEquiposModel";

// Get all zonas_equipos by torneo
export const getZonasEquiposByTorneoController = async (
  req: Request,
  res: Response
) => {
  try {
    const idTorneo = Number(req.params.idTorneo);
    const zonasEquipos = await getZonasEquiposByTorneo(idTorneo);

    if (!zonasEquipos) {
      return res
        .status(404)
        .json({ message: "No se encontraron equipos para este torneo." });
    }

    res.status(200).json(zonasEquipos);
  } catch (error) {
    console.error("❌ Error al obtener los equipos de zona:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los equipos de zona.", error });
  }
};

// Get single zona_equipo by id
export const getZonaEquipoController = async (req: Request, res: Response) => {
  try {
    const zonaEquipo = await getZonaEquipoById(Number(req.params.id));

    if (!zonaEquipo) {
      return res.status(404).json({ message: "Equipo de zona no encontrado." });
    }

    res.status(200).json(zonaEquipo);
  } catch (error) {
    console.error("❌ Error al obtener equipo de zona:", error);
    res
      .status(500)
      .json({ message: "Error al obtener el equipo de zona.", error });
  }
};

// Create zona_equipo
export const createZonaEquipoController = async (
  req: Request,
  res: Response
) => {
  try {
    const zonaEquipo = req.body;

    // Asegurarse de que idusuario esté presente
    if (!zonaEquipo.idusuario) {
      return res.status(400).json({ message: "El idusuario es requerido." });
    }

    const newZonaEquipo = await createZonaEquipo(zonaEquipo);

    return res.status(201).json({
      message: "Equipo de zona creado exitosamente.",
      zonaEquipo: newZonaEquipo,
    });
  } catch (error) {
    console.error("❌ Error al crear equipo de zona:", error);
    return res
      .status(500)
      .json({ message: "Error al crear equipo de zona.", error });
  }
};

// Update zona_equipo
export const updateZonaEquipoController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const zonaEquipoActualizado = await updateZonaEquipo(id, req.body);

    if (!zonaEquipoActualizado) {
      return res.status(404).json({ message: "Equipo de zona no encontrado." });
    }

    return res.status(200).json({
      message: "Equipo de zona actualizado exitosamente.",
      zonaEquipo: zonaEquipoActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar equipo de zona:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar el equipo de zona.", error });
  }
};

// Delete zona_equipo (soft delete)
export const deleteZonaEquipoController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteZonaEquipo(id);

    if (!deleted) {
      return res.status(404).json({ message: "Equipo de zona no encontrado." });
    }

    return res.status(200).json({
      message: "Equipo de zona eliminado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar equipo de zona:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar el equipo de zona.", error });
  }
};
