import { Request, Response } from "express";
import {
  getJugadoresDeEquipoEnPartido,
  upsertPartidoJugador,
} from "../models/partidosJugadoresModel";
import { getPartidoById } from "../models/partidosModel";
import { pool } from "../config/db";

// GET /api/partidos/:idpartido/equipos/:idequipo/jugadores
export const getJugadoresPartidoEquipoController = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("🔍 Parámetros recibidos:", req.params);

    const idpartido = Number(req.params.idpartido);
    const idequipo = Number(req.params.idequipo);

    console.log("🔍 Valores convertidos:", { idpartido, idequipo });

    if (isNaN(idpartido) || isNaN(idequipo)) {
      return res.status(400).json({ message: "Parámetros inválidos." });
    }

    // Verificar rangos
    if (idpartido > 2147483647 || idequipo > 2147483647) {
      console.log("❌ Números fuera de rango INTEGER:", {
        idpartido,
        idequipo,
      });
      return res.status(400).json({ message: "IDs fuera de rango permitido." });
    }

    const partido = await getPartidoById(idpartido);
    if (!partido) {
      return res.status(404).json({ message: "Partido no encontrado." });
    }

    console.log("✅ Llamando a getJugadoresDeEquipoEnPartido...");
    const jugadores = await getJugadoresDeEquipoEnPartido(idpartido, idequipo);

    console.log("✅ Jugadores obtenidos:", jugadores.length);
    return res.json(jugadores);
  } catch (error) {
    console.error("❌ Error completo:", error);
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

    // Validaciones mínimas
    if (!data || typeof data.idjugador !== "number") {
      return res
        .status(400)
        .json({ message: "Datos incompletos o inválidos para guardar." });
    }

    // Verificar si el jugador ya está en el partido
    const jugadorExistente = await pool.query(
      "SELECT 1 FROM partidos_jugadores WHERE idpartido = $1 AND idjugador = $2",
      [idpartido, data.idjugador]
    );

    if (jugadorExistente.rows.length > 0) {
      // Si ya existe, actualizar
      const result = await upsertPartidoJugador(idpartido, idequipo, data);
      return res.json({
        ...result,
        message: "Jugador actualizado en el partido.",
      });
    } else {
      // Verificar que el jugador pertenezca al equipo
      const jugadorEnEquipo = await pool.query(
        `SELECT 1 FROM wequipos_jugadores wej 
         WHERE wej.idequipo = $1 AND wej.idjugador = $2 AND wej.fhbaja IS NULL`,
        [idequipo, data.idjugador]
      );

      if (jugadorEnEquipo.rows.length === 0) {
        return res.status(400).json({
          message: "El jugador no pertenece a este equipo.",
        });
      }

      // Si no existe, crear
      const result = await upsertPartidoJugador(idpartido, idequipo, data);
      return res.json({
        ...result,
        message: "Jugador agregado al partido.",
      });
    }
  } catch (error) {
    console.error("Error al guardar jugador en partido:", error);
    res.status(500).json({ message: "Error al guardar jugador en partido." });
  }
};

// En Backend/src/controllers/partidosJugadoresController.ts
// Agregar esta función después de upsertPartidoJugadorController:

export const deletePartidoJugadorController = async (
  req: Request,
  res: Response
) => {
  try {
    const idpartido = Number(req.params.idpartido);
    const idequipo = Number(req.params.idequipo);
    const idjugador = Number(req.params.idjugador);

    if (isNaN(idpartido) || isNaN(idequipo) || isNaN(idjugador)) {
      return res.status(400).json({ message: "Parámetros inválidos." });
    }

    // Verificar si el jugador está en el partido
    const jugadorEnPartido = await pool.query(
      "SELECT 1 FROM partidos_jugadores WHERE idpartido = $1 AND idjugador = $2",
      [idpartido, idjugador]
    );

    if (jugadorEnPartido.rows.length === 0) {
      return res.status(404).json({
        message: "El jugador no está en este partido.",
      });
    }

    // Eliminar el jugador del partido
    await pool.query(
      "DELETE FROM partidos_jugadores WHERE idpartido = $1 AND idjugador = $2",
      [idpartido, idjugador]
    );

    return res.json({
      message: "Jugador eliminado del partido exitosamente.",
    });
  } catch (error) {
    console.error("Error al eliminar jugador del partido:", error);
    res.status(500).json({ message: "Error al eliminar jugador del partido." });
  }
};
