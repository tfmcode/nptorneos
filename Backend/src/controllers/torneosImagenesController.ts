import { Request, Response } from "express";
import {
  getTorneoImagenById,
  getTorneoImagenesByTorneo,
  createTorneoImagen,
  updateTorneoImagen,
  deleteTorneoImagen,
} from "../models/torneosImagenesModel";

export const getTorneoImagenesByTorneoController = async (
  req: Request,
  res: Response
) => {
  try {
    const idTorneo = Number(req.params.idTorneo);
    const imagenes = await getTorneoImagenesByTorneo(idTorneo);

    if (!imagenes) {
      return res
        .status(404)
        .json({ message: "No se encontraron imágenes para este torneo." });
    }

    res.status(200).json(imagenes);
  } catch (error) {
    console.error("❌ Error al obtener las imágenes del torneo:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las imágenes del torneo.", error });
  }
};

export const getTorneoImagenController = async (
  req: Request,
  res: Response
) => {
  try {
    const imagen = await getTorneoImagenById(Number(req.params.id));

    if (!imagen) {
      return res
        .status(404)
        .json({ message: "Imagen de torneo no encontrada." });
    }

    res.status(200).json(imagen);
  } catch (error) {
    console.error("❌ Error al obtener imagen de torneo:", error);
    res
      .status(500)
      .json({ message: "Error al obtener la imagen de torneo.", error });
  }
};

export const createTorneoImagenController = async (
  req: Request,
  res: Response
) => {
  try {
    const imagen = req.body;
    const newImagen = await createTorneoImagen(imagen);

    return res.status(201).json({
      message: "Imagen de torneo creada exitosamente.",
      imagen: newImagen,
    });
  } catch (error) {
    console.error("❌ Error al crear imagen de torneo:", error);
    return res
      .status(500)
      .json({ message: "Error al crear imagen de torneo.", error });
  }
};

export const updateTorneoImagenController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const imagenActualizada = await updateTorneoImagen(id, req.body);

    if (!imagenActualizada) {
      return res
        .status(404)
        .json({ message: "Imagen de torneo no encontrada." });
    }

    return res.status(200).json({
      message: "Imagen de torneo actualizada exitosamente.",
      imagen: imagenActualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar imagen de torneo:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar la imagen de torneo.", error });
  }
};

export const deleteTorneoImagenController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteTorneoImagen(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Imagen de torneo no encontrada." });
    }

    return res.status(200).json({
      message: "Imagen de torneo eliminada exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar imagen de torneo:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar la imagen de torneo.", error });
  }
};
