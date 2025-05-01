import { Request, Response } from "express";
import {
  getAllSedes,
  getSedeById,
  createSede,
  updateSede,
  deleteSede,
} from "../models/sedesModel";

export const getSedes = async (req: Request, res: Response) => {
  try {
    const sedes = await getAllSedes();
    res.status(200).json(sedes);
  } catch (error) {
    console.error("❌ Error al obtener las sedes:", error);
    res.status(500).json({ message: "Error al obtener las sedes.", error });
  }
};

export const getSede = async (req: Request, res: Response) => {
  try {
    const sede = await getSedeById(Number(req.params.id));

    if (!sede) {
      return res.status(404).json({ message: "Sede no encontrada." });
    }

    res.status(200).json(sede);
  } catch (error) {
    console.error("❌ Error al obtener sede:", error);
    res.status(500).json({ message: "Error al obtener la sede.", error });
  }
};

export const createSedeController = async (req: Request, res: Response) => {
  try {
    const sede = req.body;

    if (!sede.nombre || !sede.domicilio) {
      return res
        .status(400)
        .json({ message: "Los campos nombre y domicilio son obligatorios." });
    }

    const newSede = await createSede(sede);

    return res.status(201).json({
      message: "Sede creada exitosamente.",
      sede: newSede,
    });
  } catch (error) {
    console.error("❌ Error al crear sede:", error);
    return res.status(500).json({ message: "Error al crear sede.", error });
  }
};

export const updateSedeController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const sedeActualizada = await updateSede(id, req.body);

    if (!sedeActualizada) {
      return res.status(404).json({ message: "Sede no encontrada." });
    }

    return res.status(200).json({
      message: "Sede actualizada exitosamente.",
      sede: sedeActualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar sede:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar la sede.", error });
  }
};

export const deleteSedeController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteSede(id);

    if (!deleted) {
      return res.status(404).json({ message: "Sede no encontrada." });
    }

    return res.status(200).json({
      message: "Sede eliminada exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar sede:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar la sede.", error });
  }
};
