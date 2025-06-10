import { Request, Response } from "express";
import {
  getPartidoById,
  getPartidosByZona,
  createPartido,
  updatePartido,
  deletePartido,
} from "../models/partidosModel";

export const getPartidosByZonaController = async (
  req: Request,
  res: Response
) => {
  try {
    const idZona = Number(req.params.idZona);
    const partidos = await getPartidosByZona(idZona);

    if (!partidos) {
      return res
        .status(404)
        .json({ message: "No se encontraron partidos para esta zona." });
    }

    res.status(200).json(partidos);
  } catch (error) {
    console.error("❌ Error al obtener los partidos de zona:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los partidos de zona.", error });
  }
};

export const getPartidoController = async (req: Request, res: Response) => {
  try {
    const partido = await getPartidoById(Number(req.params.id));

    if (!partido) {
      return res.status(404).json({ message: "Partido no encontrado." });
    }

    res.status(200).json(partido);
  } catch (error) {
    console.error("❌ Error al obtener partido:", error);
    res.status(500).json({ message: "Error al obtener el partido.", error });
  }
};

export const createPartidoController = async (req: Request, res: Response) => {
  try {
    const partido = req.body;

    if (!partido.idzona || !partido.idequipo1 || !partido.idequipo2) {
      return res
        .status(400)
        .json({ message: "idzona, idequipo1 e idequipo2 son requeridos." });
    }

    const newPartido = await createPartido(partido);

    return res.status(201).json({
      message: "Partido creado exitosamente.",
      partido: newPartido,
    });
  } catch (error) {
    console.error("❌ Error al crear partido:", error);
    return res.status(500).json({ message: "Error al crear partido.", error });
  }
};

export const updatePartidoController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const partidoActualizado = await updatePartido(id, req.body);

    if (!partidoActualizado) {
      return res.status(404).json({ message: "Partido no encontrado." });
    }

    return res.status(200).json({
      message: "Partido actualizado exitosamente.",
      partido: partidoActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar partido:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar el partido.", error });
  }
};

export const deletePartidoController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deletePartido(id);

    if (!deleted) {
      return res.status(404).json({ message: "Partido no encontrado." });
    }

    return res.status(200).json({
      message: "Partido eliminado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar partido:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar el partido.", error });
  }
};
