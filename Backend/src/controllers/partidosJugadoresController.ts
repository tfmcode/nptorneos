import { Request, Response } from "express";
import {
  getJugadoresDeEquipoEnPartido,
  upsertPartidoJugador,
} from "../models/partidosJugadoresModel";
import { getPartidoById } from "../models/partidosModel";

// GET /api/partidos/:idpartido/equipos/:idequipo/jugadores
export const getJugadoresPartidoEquipoController = async (
  req: Request,
  res: Response
) => {
  try {
    const idpartido = Number(req.params.idpartido);
    const idequipo = Number(req.params.idequipo);

    if (isNaN(idpartido) || isNaN(idequipo)) {
      return res.status(400).json({ message: "Parámetros inválidos." });
    }

    const partido = await getPartidoById(idpartido);
    if (!partido) {
      return res.status(404).json({ message: "Partido no encontrado." });
    }

    const jugadores = await getJugadoresDeEquipoEnPartido(idpartido, idequipo);
    return res.json(jugadores);
  } catch (error) {
    console.error(
      "Error al obtener jugadores del equipo en el partido:",
      error
    );
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// POST /api/partidos/:idpartido/equipos/:idequipo/jugadores
export const upsertPartidoJugadorController = async (
  req: Request,
  res: Response
) => {
  try {
    const idpartido = Number(req.params.idpartido);
    const idequipo = Number(req.params.idequipo);
    const data = req.body;

    if (isNaN(idpartido) || isNaN(idequipo)) {
      return res.status(400).json({ message: "Parámetros inválidos." });
    }

    // Validaciones mínimas (podés hacerlas con express-validator si querés más robustez)
    if (!data || typeof data.idjugador !== "number") {
      return res
        .status(400)
        .json({ message: "Datos incompletos o inválidos para guardar." });
    }

    const result = await upsertPartidoJugador(idpartido, idequipo, data);
    return res.json(result);
  } catch (error) {
    console.error("Error al guardar jugador en partido:", error);
    res.status(500).json({ message: "Error al guardar jugador en partido." });
  }
};
