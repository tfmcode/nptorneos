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

    // ✅ VALIDACIÓN: Verificar si el jugador ya está en el partido (en cualquier equipo)
    const jugadorEnPartido = await pool.query(
      "SELECT idequipo FROM partidos_jugadores WHERE idpartido = $1 AND idjugador = $2",
      [idpartido, data.idjugador]
    );

    if (jugadorEnPartido.rows.length > 0) {
      const equipoExistente = jugadorEnPartido.rows[0].idequipo;

      if (equipoExistente === idequipo) {
        // Si ya existe en el mismo equipo, actualizar
        const result = await upsertPartidoJugador(idpartido, idequipo, data);
        return res.json({
          ...result,
          message: "Jugador actualizado en el partido.",
        });
      } else {
        // Si está en el equipo contrario, no permitir
        return res.status(400).json({
          message:
            "El jugador ya está registrado en el equipo contrario de este partido.",
        });
      }
    }

    // ✅ VALIDACIÓN: Verificar que el jugador pertenezca al equipo
    const jugadorEnEquipo = await pool.query(
      `SELECT 1 FROM wequipos_jugadores wej 
       WHERE wej.idequipo = $1 AND wej.idjugador = $2 AND wej.fhbaja IS NULL AND wej.codestado = 1`,
      [idequipo, data.idjugador]
    );

    if (jugadorEnEquipo.rows.length === 0) {
      return res.status(400).json({
        message: "El jugador no pertenece a este equipo o está inactivo.",
      });
    }

    // Si no existe, crear
    const result = await upsertPartidoJugador(idpartido, idequipo, data);
    return res.json({
      ...result,
      message: "Jugador agregado al partido.",
    });
  } catch (error) {
    console.error("Error al guardar jugador en partido:", error);
    res.status(500).json({ message: "Error al guardar jugador en partido." });
  }
};

// ✅ CONTROLADOR DELETE CON DEBUG DETALLADO
// Reemplaza la función deletePartidoJugadorController en tu partidosJugadoresController.ts

export const deletePartidoJugadorController = async (
  req: Request,
  res: Response
) => {
  console.log("🗑️ CONTROLLER - Inicio eliminación:", {
    params: req.params,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  try {
    const idpartido = Number(req.params.idpartido);
    const idequipo = Number(req.params.idequipo);
    const idjugador = Number(req.params.idjugador);

    console.log("🔍 CONTROLLER - Parámetros parseados:", {
      idpartido,
      idequipo,
      idjugador,
      tipos: {
        idpartido: typeof idpartido,
        idequipo: typeof idequipo,
        idjugador: typeof idjugador,
      },
    });

    // Validar parámetros
    if (isNaN(idpartido) || isNaN(idequipo) || isNaN(idjugador)) {
      console.error("❌ CONTROLLER - Parámetros inválidos");
      return res.status(400).json({
        message: "Parámetros inválidos.",
        received: { idpartido, idequipo, idjugador },
      });
    }

    // Verificar si el jugador está en el partido
    console.log(
      "🔍 CONTROLLER - Verificando existencia del jugador en el partido..."
    );
    const jugadorEnPartido = await pool.query(
      "SELECT idpartido, idjugador, idequipo FROM partidos_jugadores WHERE idpartido = $1 AND idjugador = $2",
      [idpartido, idjugador]
    );

    console.log("🔍 CONTROLLER - Resultado consulta existencia:", {
      rowCount: jugadorEnPartido.rowCount,
      rows: jugadorEnPartido.rows,
    });

    if (jugadorEnPartido.rows.length === 0) {
      console.error("❌ CONTROLLER - Jugador no encontrado en el partido");
      return res.status(404).json({
        message: "El jugador no está en este partido.",
        searched: { idpartido, idjugador },
      });
    }

    const registroExistente = jugadorEnPartido.rows[0];
    console.log("✅ CONTROLLER - Jugador encontrado:", registroExistente);

    // Verificar que el jugador pertenece al equipo correcto (opcional, para debug)
    if (registroExistente.idequipo !== idequipo) {
      console.warn(
        "⚠️ CONTROLLER - Jugador encontrado pero en equipo diferente:",
        {
          equipoEncontrado: registroExistente.idequipo,
          equipoSolicitado: idequipo,
        }
      );
    }

    // Eliminar el jugador del partido
    console.log("🗑️ CONTROLLER - Ejecutando DELETE...");
    const deleteResult = await pool.query(
      "DELETE FROM partidos_jugadores WHERE idpartido = $1 AND idjugador = $2",
      [idpartido, idjugador]
    );

    console.log("✅ CONTROLLER - Resultado DELETE:", {
      rowCount: deleteResult.rowCount,
      command: deleteResult.command,
    });

    if (deleteResult.rowCount === 0) {
      console.error("❌ CONTROLLER - DELETE no eliminó ningún registro");
      return res.status(404).json({
        message: "No se pudo eliminar el jugador del partido.",
        sqlResult: { rowCount: deleteResult.rowCount },
      });
    }

    console.log("✅ CONTROLLER - Eliminación exitosa");
    return res.status(200).json({
      message: "Jugador eliminado del partido exitosamente.",
      deletedCount: deleteResult.rowCount,
      eliminated: { idpartido, idjugador, idequipo },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ CONTROLLER - Error completo:", {
      error: error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      message: "Error al eliminar jugador del partido.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
