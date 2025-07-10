import { Request, Response } from "express";
import {
  getMenuTorneosByOpcion,
  createMenuTorneo,
  updateMenuTorneo,
  deleteMenuTorneo,
  IMenuTorneo,
} from "../models/menuTorneosModel";

export const getMenuTorneosController = async (req: Request, res: Response) => {
  try {
    const idopcion = Number(req.params.idopcion);
    const menutorneos = await getMenuTorneosByOpcion(idopcion);

    if (!menutorneos || menutorneos.length === 0) {
      return res.status(404).json({
        message: "No se encontraron menús para esta opción.",
      });
    }

    res.status(200).json(menutorneos);
  } catch (error) {
    console.error("❌ Error al obtener menús de torneos:", error);
    res
      .status(500)
      .json({ message: "Error al obtener menús de torneos.", error });
  }
};

export const createMenuTorneoController = async (
  req: Request,
  res: Response
) => {
  try {
    const menuTorneo: IMenuTorneo = req.body;

    // Validaciones mínimas
    if (!menuTorneo.idopcion || !menuTorneo.orden) {
      return res.status(400).json({
        message: "idopcion y orden son requeridos para crear el menú.",
      });
    }

    const newMenu = await createMenuTorneo(menuTorneo);

    res.status(201).json({
      message: "Menú de torneo creado exitosamente.",
      menu: newMenu,
    });
  } catch (error) {
    console.error("❌ Error al crear menú de torneo:", error);
    res.status(500).json({ message: "Error al crear menú de torneo.", error });
  }
};

export const updateMenuTorneoController = async (
  req: Request,
  res: Response
) => {
  try {
    const idopcion = Number(req.params.idopcion);
    const orden = Number(req.params.orden);
    const updates: Partial<IMenuTorneo> = req.body;

    const updatedMenu = await updateMenuTorneo(idopcion, orden, updates);

    if (!updatedMenu) {
      return res.status(404).json({
        message: "Menú de torneo no encontrado para actualizar.",
      });
    }

    res.status(200).json({
      message: "Menú de torneo actualizado exitosamente.",
      menu: updatedMenu,
    });
  } catch (error) {
    console.error("❌ Error al actualizar menú de torneo:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar menú de torneo.", error });
  }
};

export const deleteMenuTorneoController = async (
  req: Request,
  res: Response
) => {
  try {
    const idopcion = Number(req.params.idopcion);
    const orden = Number(req.params.orden);

    const deleted = await deleteMenuTorneo(idopcion, orden);

    if (!deleted) {
      return res.status(404).json({
        message: "Menú de torneo no encontrado para eliminar.",
      });
    }

    res.status(200).json({
      message: "Menú de torneo eliminado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar menú de torneo:", error);
    res
      .status(500)
      .json({ message: "Error al eliminar menú de torneo.", error });
  }
};
