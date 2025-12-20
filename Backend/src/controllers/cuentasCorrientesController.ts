import { Request, Response } from "express";
import {
  getCuentaCorrienteEquipo,
  getCuentasCorrientesGeneral,
} from "../models/cuentasCorrientesModel";

/**
 * Obtener cuenta corriente de un equipo específico
 */
export const getCuentaCorrienteEquipoController = async (
  req: Request,
  res: Response
) => {
  try {
    const idequipo = Number(req.params.idequipo);

    if (!idequipo || isNaN(idequipo)) {
      return res.status(400).json({ message: "ID de equipo inválido." });
    }

    const cuentaCorriente = await getCuentaCorrienteEquipo(idequipo);

    res.status(200).json(cuentaCorriente);
  } catch (error) {
    console.error("❌ Error al obtener cuenta corriente del equipo:", error);
    res.status(500).json({
      message: "Error al obtener cuenta corriente del equipo.",
      error,
    });
  }
};

/**
 * Obtener resumen de cuentas corrientes de todos los equipos
 */
export const getCuentasCorrientesGeneralController = async (
  req: Request,
  res: Response
) => {
  try {
    const resumenes = await getCuentasCorrientesGeneral();

    res.status(200).json(resumenes);
  } catch (error) {
    console.error("❌ Error al obtener cuentas corrientes generales:", error);
    res.status(500).json({
      message: "Error al obtener cuentas corrientes generales.",
      error,
    });
  }
};
