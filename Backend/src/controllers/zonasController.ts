import { Request, Response } from "express";
import {
  getZonaById,
  getZonaByTorneoId,
  createZona,
  updateZona,
  deleteZona,
} from "../models/zonasModel";

export const getZonasByTorneo = async (req: Request, res: Response) => {
  try {
    const idTorneo = Number(req.params.idTorneo);
    const zonas = await getZonaByTorneoId(idTorneo);

    if (!zonas) {
      return res
        .status(404)
        .json({ message: "No se encontraron zonas para este torneo." });
    }

    res.status(200).json(zonas);
  } catch (error) {
    console.error("❌ Error al obtener las zonas:", error);
    res.status(500).json({ message: "Error al obtener las zonas.", error });
  }
};

export const getZona = async (req: Request, res: Response) => {
  try {
    const zona = await getZonaById(Number(req.params.id));

    if (!zona) {
      return res.status(404).json({ message: "Zona no encontrada." });
    }

    res.status(200).json(zona);
  } catch (error) {
    console.error("❌ Error al obtener zona:", error);
    res.status(500).json({ message: "Error al obtener la zona.", error });
  }
};

export const createZonaController = async (req: Request, res: Response) => {
  try {
    const zona = req.body;

    // Asegurarse de que idusuario esté presente
    if (!zona.idusuario) {
      return res.status(400).json({ message: "El idusuario es requerido." });
    }

    const newZona = await createZona(zona);

    return res.status(201).json({
      message: "Zona creada exitosamente.",
      zona: newZona,
    });
  } catch (error) {
    console.error("❌ Error al crear zona:", error);
    return res.status(500).json({ message: "Error al crear zona.", error });
  }
};

export const updateZonaController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const zonaActualizada = await updateZona(id, req.body);

    if (!zonaActualizada) {
      return res.status(404).json({ message: "Zona no encontrada." });
    }

    return res.status(200).json({
      message: "Zona actualizada exitosamente.",
      zona: zonaActualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar zona:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar la zona.", error });
  }
};

export const deleteZonaController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteZona(id);

    if (!deleted) {
      return res.status(404).json({ message: "Zona no encontrada." });
    }

    return res.status(200).json({
      message: "Zona eliminada exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar zona:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar la zona.", error });
  }
};
