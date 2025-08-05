import { Request, Response } from "express";
import {
  getFechasByFiltro,
  getFechaById,
  createFecha,
  updateFecha,
  deleteFecha,
} from "../models/fechasModel";

export const getFechas = async (req: Request, res: Response) => {
  try {
    const { desde, hasta, idtorneo } = req.query;

    const fechas = await getFechasByFiltro(
      desde as string,
      hasta as string,
      idtorneo ? Number(idtorneo) : undefined
    );

    return res.status(200).json(fechas);
  } catch (error) {
    console.error("❌ Error al obtener fechas:", error);
    return res.status(500).json({ message: "Error al obtener fechas.", error });
  }
};

export const getFechaByIdController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const fecha = await getFechaById(id);

    if (!fecha) {
      return res.status(404).json({ message: "Fecha no encontrada." });
    }

    return res.status(200).json(fecha);
  } catch (error) {
    console.error("❌ Error al obtener fecha:", error);
    return res.status(500).json({ message: "Error al obtener fecha.", error });
  }
};

export const createFechaController = async (req: Request, res: Response) => {
  try {
    const nueva = await createFecha(req.body);
    return res.status(201).json({
      message: "Fecha creada exitosamente.",
      fecha: nueva,
    });
  } catch (error) {
    console.error("❌ Error al crear fecha:", error);
    return res.status(500).json({ message: "Error al crear fecha.", error });
  }
};

export const updateFechaController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const actualizada = await updateFecha(id, req.body);

    if (!actualizada) {
      return res.status(404).json({ message: "Fecha no encontrada." });
    }

    return res.status(200).json({
      message: "Fecha actualizada exitosamente.",
      fecha: actualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar fecha:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar la fecha.", error });
  }
};

export const deleteFechaController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteFecha(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Fecha no encontrada o ya dada de baja." });
    }

    return res.status(200).json({
      message: "Fecha eliminada correctamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar fecha:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar la fecha.", error });
  }
};
