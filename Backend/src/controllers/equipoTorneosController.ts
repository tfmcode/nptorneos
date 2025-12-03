import { Request, Response } from "express";
import { getTorneosByEquipoFromPartidos } from "../models/equipoTorneosModel";

export const getTorneosByEquipoController = async (
  req: Request,
  res: Response
) => {
  try {
    const idEquipo = Number(req.params.idEquipo);
    const torneos = await getTorneosByEquipoFromPartidos(idEquipo);

    if (!torneos || torneos.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron torneos para este equipo." });
    }

    res.status(200).json(torneos);
  } catch (error) {
    console.error("❌ Error al obtener torneos del equipo:", error);
    res
      .status(500)
      .json({ message: "Error al obtener torneos del equipo.", error });
  }
};
