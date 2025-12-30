import { Request, Response } from "express";
import * as planillasModel from "../models/planillasPagoModel";
import { PlanillasFiltros } from "../types/planillasPago";

export const getPlanillasController = async (req: Request, res: Response) => {
  try {
    const filtros: PlanillasFiltros = {
      idtorneo: req.query.idtorneo ? Number(req.query.idtorneo) : undefined,
      fecha_desde: req.query.fecha_desde as string,
      fecha_hasta: req.query.fecha_hasta as string,
      idsede: req.query.idsede ? Number(req.query.idsede) : undefined,
      estado: req.query.estado as "abierta" | "cerrada" | "contabilizada",
    };

    const planillas = await planillasModel.getPlanillasByFiltros(filtros);
    return res.status(200).json(planillas);
  } catch (error) {
    console.error("❌ Error al obtener planillas:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener planillas.", error });
  }
};

export const getPlanillaCompletaController = async (
  req: Request,
  res: Response
) => {
  try {
    const idfecha = Number(req.params.idfecha);

    if (isNaN(idfecha)) {
      return res.status(400).json({ message: "ID de fecha inválido." });
    }

    const planillaCompleta = await planillasModel.getPlanillaByIdFecha(idfecha);

    if (!planillaCompleta) {
      return res.status(404).json({ message: "Planilla no encontrada." });
    }

    return res.status(200).json(planillaCompleta);
  } catch (error) {
    console.error("❌ Error al obtener planilla completa:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener planilla completa.", error });
  }
};

export const createPlanillaController = async (req: Request, res: Response) => {
  try {
    const { idfecha } = req.body;

    if (!idfecha) {
      return res.status(400).json({
        message: "Campo obligatorio: idfecha",
      });
    }

    const existente = await planillasModel.getPlanillaByIdFecha(idfecha);
    if (existente) {
      return res.status(400).json({
        message: "Ya existe una planilla para este partido/fecha.",
      });
    }

    const nuevaPlanilla = await planillasModel.createPlanilla(idfecha);

    return res.status(201).json({
      message: "Planilla creada exitosamente.",
      planilla: nuevaPlanilla,
    });
  } catch (error) {
    console.error("❌ Error al crear planilla:", error);
    return res.status(500).json({ message: "Error al crear planilla.", error });
  }
};

export const cerrarPlanillaController = async (req: Request, res: Response) => {
  try {
    const idfecha = Number(req.params.idfecha);
    const { idprofesor } = req.body;

    if (!idprofesor) {
      return res.status(400).json({
        message: "Se requiere idprofesor para cerrar la planilla.",
      });
    }

    await planillasModel.cerrarPlanilla(idfecha, idprofesor);

    return res.status(200).json({
      message: "Planilla cerrada exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al cerrar planilla:", error);
    return res
      .status(500)
      .json({ message: "Error al cerrar planilla.", error });
  }
};

export const cerrarCajaController = async (req: Request, res: Response) => {
  try {
    const idfecha = Number(req.params.idfecha);
    const idusuario = req.body.idusuario || 1;

    await planillasModel.cerrarCaja(idfecha, idusuario);

    return res.status(200).json({
      message: "Caja cerrada (contabilizada) exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al cerrar caja:", error);
    return res.status(500).json({ message: "Error al cerrar caja.", error });
  }
};

export const reabrirPlanillaController = async (
  req: Request,
  res: Response
) => {
  try {
    const idfecha = Number(req.params.idfecha);

    if (isNaN(idfecha)) {
      return res.status(400).json({ message: "ID de fecha inválido." });
    }

    await planillasModel.reabrirPlanilla(idfecha);

    return res.status(200).json({
      message: "Planilla reabierta exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al reabrir planilla:", error);
    return res
      .status(500)
      .json({ message: "Error al reabrir planilla.", error });
  }
};

export const updateTurnoController = async (req: Request, res: Response) => {
  try {
    const idfecha = Number(req.params.idfecha);
    const { idturno } = req.body;

    if (isNaN(idfecha)) {
      return res.status(400).json({ message: "ID de fecha inválido." });
    }

    await planillasModel.updateTurno(idfecha, idturno);

    return res.status(200).json({
      message: "Turno actualizado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al actualizar turno:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar turno.", error });
  }
};

export const addEquipoController = async (req: Request, res: Response) => {
  try {
    const equipoGuardado = await planillasModel.addEquipo(req.body);
    return res.status(201).json({
      message: "Equipo agregado exitosamente.",
      equipo: equipoGuardado,
    });
  } catch (error) {
    console.error("❌ Error al agregar equipo:", error);
    return res.status(500).json({ message: "Error al agregar equipo.", error });
  }
};

export const updateEquipoController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const equipoActualizado = await planillasModel.updateEquipo(
      Number(idfecha),
      Number(orden),
      req.body
    );
    return res.status(200).json({
      message: "Equipo actualizado exitosamente.",
      equipo: equipoActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar equipo:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar equipo.", error });
  }
};

export const deleteEquipoController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteEquipo(
      Number(idfecha),
      Number(orden)
    );

    if (!deleted) {
      return res.status(404).json({ message: "Equipo no encontrado." });
    }

    return res.status(200).json({ message: "Equipo eliminado exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar equipo:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar equipo.", error });
  }
};

export const addArbitroController = async (req: Request, res: Response) => {
  try {
    const arbitroGuardado = await planillasModel.addArbitro(req.body);
    return res.status(201).json({
      message: "Árbitro agregado exitosamente.",
      arbitro: arbitroGuardado,
    });
  } catch (error) {
    console.error("❌ Error al agregar árbitro:", error);
    return res
      .status(500)
      .json({ message: "Error al agregar árbitro.", error });
  }
};

export const updateArbitroController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const arbitroActualizado = await planillasModel.updateArbitro(
      Number(idfecha),
      Number(orden),
      req.body
    );
    return res.status(200).json({
      message: "Árbitro actualizado exitosamente.",
      arbitro: arbitroActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar árbitro:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar árbitro.", error });
  }
};

export const deleteArbitroController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteArbitro(
      Number(idfecha),
      Number(orden)
    );

    if (!deleted) {
      return res.status(404).json({ message: "Árbitro no encontrado." });
    }

    return res.status(200).json({ message: "Árbitro eliminado exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar árbitro:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar árbitro.", error });
  }
};

export const addCanchaController = async (req: Request, res: Response) => {
  try {
    const canchaGuardada = await planillasModel.addCancha(req.body);
    return res.status(201).json({
      message: "Cancha agregada exitosamente.",
      cancha: canchaGuardada,
    });
  } catch (error) {
    console.error("❌ Error al agregar cancha:", error);
    return res.status(500).json({ message: "Error al agregar cancha.", error });
  }
};

export const updateCanchaController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const canchaActualizada = await planillasModel.updateCancha(
      Number(idfecha),
      Number(orden),
      req.body
    );
    return res.status(200).json({
      message: "Cancha actualizada exitosamente.",
      cancha: canchaActualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar cancha:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar cancha.", error });
  }
};

export const deleteCanchaController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteCancha(
      Number(idfecha),
      Number(orden)
    );

    if (!deleted) {
      return res.status(404).json({ message: "Cancha no encontrada." });
    }

    return res.status(200).json({ message: "Cancha eliminada exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar cancha:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar cancha.", error });
  }
};

export const addProfesorController = async (req: Request, res: Response) => {
  try {
    const profesorGuardado = await planillasModel.addProfesor(req.body);
    return res.status(201).json({
      message: "Profesor agregado exitosamente.",
      profesor: profesorGuardado,
    });
  } catch (error) {
    console.error("❌ Error al agregar profesor:", error);
    return res
      .status(500)
      .json({ message: "Error al agregar profesor.", error });
  }
};

export const updateProfesorController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const profesorActualizado = await planillasModel.updateProfesor(
      Number(idfecha),
      Number(orden),
      req.body
    );
    return res.status(200).json({
      message: "Profesor actualizado exitosamente.",
      profesor: profesorActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar profesor:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar profesor.", error });
  }
};

export const deleteProfesorController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteProfesor(
      Number(idfecha),
      Number(orden)
    );

    if (!deleted) {
      return res.status(404).json({ message: "Profesor no encontrado." });
    }

    return res
      .status(200)
      .json({ message: "Profesor eliminado exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar profesor:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar profesor.", error });
  }
};

export const addMedicoController = async (req: Request, res: Response) => {
  try {
    const medicoGuardado = await planillasModel.addMedico(req.body);
    return res.status(201).json({
      message: "Médico agregado exitosamente.",
      medico: medicoGuardado,
    });
  } catch (error) {
    console.error("❌ Error al agregar médico:", error);
    return res.status(500).json({ message: "Error al agregar médico.", error });
  }
};

export const updateMedicoController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const medicoActualizado = await planillasModel.updateMedico(
      Number(idfecha),
      Number(orden),
      req.body
    );
    return res.status(200).json({
      message: "Médico actualizado exitosamente.",
      medico: medicoActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar médico:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar médico.", error });
  }
};

export const deleteMedicoController = async (req: Request, res: Response) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteMedico(
      Number(idfecha),
      Number(orden)
    );

    if (!deleted) {
      return res.status(404).json({ message: "Médico no encontrado." });
    }

    return res.status(200).json({ message: "Médico eliminado exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar médico:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar médico.", error });
  }
};

export const addOtroGastoController = async (req: Request, res: Response) => {
  try {
    const gastoGuardado = await planillasModel.addOtroGasto(req.body);
    return res.status(201).json({
      message: "Gasto agregado exitosamente.",
      gasto: gastoGuardado,
    });
  } catch (error) {
    console.error("❌ Error al agregar gasto:", error);
    return res.status(500).json({ message: "Error al agregar gasto.", error });
  }
};

export const updateOtroGastoController = async (
  req: Request,
  res: Response
) => {
  try {
    const { idfecha, orden } = req.params;
    const gastoActualizado = await planillasModel.updateOtroGasto(
      Number(idfecha),
      Number(orden),
      req.body
    );
    return res.status(200).json({
      message: "Gasto actualizado exitosamente.",
      gasto: gastoActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar gasto:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar gasto.", error });
  }
};

export const deleteOtroGastoController = async (
  req: Request,
  res: Response
) => {
  try {
    const { idfecha, orden } = req.params;
    const deleted = await planillasModel.deleteOtroGasto(
      Number(idfecha),
      Number(orden)
    );

    if (!deleted) {
      return res.status(404).json({ message: "Gasto no encontrado." });
    }

    return res.status(200).json({ message: "Gasto eliminado exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar gasto:", error);
    return res.status(500).json({ message: "Error al eliminar gasto.", error });
  }
};

export const toggleAusenciaController = async (req: Request, res: Response) => {
  try {
    const idfecha = Number(req.params.idfecha);
    const { idequipo, ausente } = req.body;

    if (isNaN(idfecha) || !idequipo) {
      return res.status(400).json({ message: "Parámetros inválidos." });
    }

    await planillasModel.toggleAusencia(idfecha, idequipo, ausente);

    return res.status(200).json({
      message: "Ausencia actualizada exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al actualizar ausencia:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar ausencia.", error });
  }
};

export const updatePagoFechaController = async (
  req: Request,
  res: Response
) => {
  try {
    const idfecha = Number(req.params.idfecha);
    const { idequipo, importe } = req.body;

    if (isNaN(idfecha) || !idequipo || importe === undefined) {
      return res.status(400).json({ message: "Parámetros inválidos." });
    }

    await planillasModel.updatePagoFecha(idfecha, idequipo, Number(importe));

    return res.status(200).json({
      message: "Pago de fecha actualizado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al actualizar pago fecha:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar pago fecha.", error });
  }
};

export const updatePagoInscripcionController = async (
  req: Request,
  res: Response
) => {
  try {
    const idfecha = Number(req.params.idfecha);
    const { idequipo, importe } = req.body;

    if (isNaN(idfecha) || !idequipo || importe === undefined) {
      return res.status(400).json({ message: "Parámetros inválidos." });
    }

    await planillasModel.updatePagoInscripcion(
      idfecha,
      idequipo,
      Number(importe)
    );

    return res.status(200).json({
      message: "Pago de inscripción actualizado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al actualizar pago inscripción:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar pago inscripción.", error });
  }
};

export const updatePagoDepositoController = async (
  req: Request,
  res: Response
) => {
  try {
    const idfecha = Number(req.params.idfecha);
    const { idequipo, importe } = req.body;

    if (isNaN(idfecha) || !idequipo || importe === undefined) {
      return res.status(400).json({ message: "Parámetros inválidos." });
    }

    await planillasModel.updatePagoDeposito(idfecha, idequipo, Number(importe));

    return res.status(200).json({
      message: "Pago de depósito actualizado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al actualizar pago depósito:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar pago depósito.", error });
  }
};

export const updateEfectivoRealController = async (
  req: Request,
  res: Response
) => {
  try {
    const idfecha = Number(req.params.idfecha);
    const { totefectivo } = req.body;

    if (isNaN(idfecha) || totefectivo === undefined) {
      return res.status(400).json({ message: "Parámetros inválidos." });
    }

    await planillasModel.updateEfectivoReal(idfecha, Number(totefectivo));

    return res.status(200).json({
      message: "Efectivo real actualizado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al actualizar efectivo real:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar efectivo real.", error });
  }
};

export const exportarPlanillaController = async (
  req: Request,
  res: Response
) => {
  try {
    const idfecha = Number(req.params.idfecha);

    if (isNaN(idfecha)) {
      return res.status(400).json({ message: "ID de fecha inválido." });
    }

    const planillaCompleta = await planillasModel.getPlanillaByIdFecha(idfecha);

    if (!planillaCompleta) {
      return res.status(404).json({ message: "Planilla no encontrada." });
    }

    const {
      planilla,
      equipos,
      arbitros,
      canchas,
      profesores,
      medico,
      otros_gastos,
      totales,
    } = planillaCompleta;

    const formatFecha = (fecha: string) => {
      if (!fecha) return "";
      return new Date(fecha).toLocaleDateString("es-AR");
    };

    const formatMoney = (value: number) => {
      return `$${(value || 0).toLocaleString("es-AR")}`;
    };

    let csv = "";

    csv += "═══════════════════════════════════════════════════════════════\n";
    csv += "                    PLANILLA DE CAJA\n";
    csv +=
      "═══════════════════════════════════════════════════════════════\n\n";

    csv += "INFORMACIÓN GENERAL\n";
    csv += "───────────────────────────────────────────────────────────────\n";
    csv += `Fecha:;${formatFecha(planilla.fecha)}\n`;
    csv += `Número de Fecha:;${planilla.codfecha || "-"}\n`;
    csv += `Torneo:;${planilla.torneo_nombre || "-"}\n`;
    csv += `Sede:;${planilla.sede_nombre || "-"}\n`;
    csv += `Profesor:;${planilla.profesor_nombre || "-"}\n`;
    csv += `Estado:;${
      planilla.fhcierrecaja
        ? "Contabilizada"
        : planilla.fhcierre
        ? "Cerrada"
        : "Abierta"
    }\n\n`;

    csv += "═══════════════════════════════════════════════════════════════\n";
    csv += "                         INGRESOS\n";
    csv +=
      "═══════════════════════════════════════════════════════════════\n\n";

    csv += "EQUIPOS - DETALLE DE COBROS\n";
    csv += "───────────────────────────────────────────────────────────────\n";
    csv +=
      "Equipo;Partidos;Ausente;Deuda Insc;Deuda Dep;Deuda Fecha;Total a Pagar;Pago Insc;Pago Dep;Pago Fecha;Deuda Total\n";

    let totalDeudaInsc = 0;
    let totalDeudaDep = 0;
    let totalDeudaFecha = 0;
    let totalAPagar = 0;
    let totalPagoInsc = 0;
    let totalPagoDep = 0;
    let totalPagoFecha = 0;
    let totalDeudaTotal = 0;

    equipos.forEach((eq) => {
      totalDeudaInsc += eq.deuda_insc || 0;
      totalDeudaDep += eq.deuda_dep || 0;
      totalDeudaFecha += eq.deuda_fecha || 0;
      totalAPagar += eq.total_pagar || 0;
      totalPagoInsc += eq.pago_ins || 0;
      totalPagoDep += eq.pago_dep || 0;
      totalPagoFecha += eq.pago_fecha || 0;
      totalDeudaTotal += eq.deuda_total || 0;

      csv += `${eq.nombre_equipo};${eq.cantidad_partidos};${
        eq.ausente === 1 ? "SÍ" : "NO"
      };`;
      csv += `${formatMoney(eq.deuda_insc || 0)};${formatMoney(
        eq.deuda_dep || 0
      )};${formatMoney(eq.deuda_fecha || 0)};`;
      csv += `${formatMoney(eq.total_pagar || 0)};${formatMoney(
        eq.pago_ins || 0
      )};${formatMoney(eq.pago_dep || 0)};`;
      csv += `${formatMoney(eq.pago_fecha || 0)};${formatMoney(
        eq.deuda_total || 0
      )}\n`;
    });

    csv += "───────────────────────────────────────────────────────────────\n";
    csv += `TOTALES EQUIPOS;;;${formatMoney(totalDeudaInsc)};${formatMoney(
      totalDeudaDep
    )};${formatMoney(totalDeudaFecha)};`;
    csv += `${formatMoney(totalAPagar)};${formatMoney(
      totalPagoInsc
    )};${formatMoney(totalPagoDep)};`;
    csv += `${formatMoney(totalPagoFecha)};${formatMoney(totalDeudaTotal)}\n\n`;

    csv += "RESUMEN INGRESOS\n";
    csv += "───────────────────────────────────────────────────────────────\n";
    csv += `Inscripciones:;${formatMoney(totales.ingreso_inscripciones)}\n`;
    csv += `Depósitos:;${formatMoney(totales.ingreso_depositos)}\n`;
    csv += `Pagos de Fecha:;${formatMoney(totales.ingreso_fecha)}\n`;
    csv += `TOTAL INGRESOS:;${formatMoney(totales.total_ingresos)}\n\n`;

    csv += "═══════════════════════════════════════════════════════════════\n";
    csv += "                         EGRESOS\n";
    csv +=
      "═══════════════════════════════════════════════════════════════\n\n";

    if (arbitros.length > 0) {
      csv += "ÁRBITROS\n";
      csv +=
        "───────────────────────────────────────────────────────────────\n";
      csv += "Nombre;Partidos;Valor Partido;Total\n";
      arbitros.forEach((a) => {
        csv += `${a.nombre_arbitro || `Árbitro ${a.idarbitro}`};${
          a.partidos
        };${formatMoney(a.valor_partido)};${formatMoney(a.total)}\n`;
      });
      csv += `Subtotal Árbitros:;;;${formatMoney(totales.egreso_arbitros)}\n\n`;
    }

    if (canchas.length > 0) {
      csv += "CANCHAS\n";
      csv +=
        "───────────────────────────────────────────────────────────────\n";
      csv += "Horas;Valor Hora;Total\n";
      canchas.forEach((c) => {
        csv += `${c.horas};${formatMoney(c.valor_hora)};${formatMoney(
          c.total
        )}\n`;
      });
      csv += `Subtotal Canchas:;;${formatMoney(totales.egreso_canchas)}\n\n`;
    }

    if (profesores.length > 0) {
      csv += "PROFESORES\n";
      csv +=
        "───────────────────────────────────────────────────────────────\n";
      csv += "Nombre;Horas;Valor Hora;Total\n";
      profesores.forEach((p) => {
        csv += `${p.nombre_profesor || `Profesor ${p.idprofesor}`};${
          p.horas
        };${formatMoney(p.valor_hora)};${formatMoney(p.total)}\n`;
      });
      csv += `Subtotal Profesores:;;;${formatMoney(
        totales.egreso_profesores
      )}\n\n`;
    }

    if (medico.length > 0) {
      csv += "SERVICIO MÉDICO\n";
      csv +=
        "───────────────────────────────────────────────────────────────\n";
      csv += "Nombre;Horas;Valor Hora;Total\n";
      medico.forEach((m) => {
        csv += `${m.nombre_medico || `Médico ${m.idmedico}`};${
          m.horas
        };${formatMoney(m.valor_hora)};${formatMoney(m.total)}\n`;
      });
      csv += `Subtotal Serv. Médico:;;;${formatMoney(
        totales.egreso_medico
      )}\n\n`;
    }

    if (otros_gastos.length > 0) {
      csv += "OTROS GASTOS\n";
      csv +=
        "───────────────────────────────────────────────────────────────\n";
      csv += "Descripción;Cantidad;Valor Unidad;Total\n";
      otros_gastos.forEach((g) => {
        csv += `${g.descripcion_gasto || `Gasto ${g.codgasto}`};${
          g.cantidad
        };${formatMoney(g.valor_unidad)};${formatMoney(g.total)}\n`;
      });
      csv += `Subtotal Otros Gastos:;;;${formatMoney(
        totales.egreso_otros
      )}\n\n`;
    }

    csv += "RESUMEN EGRESOS\n";
    csv += "───────────────────────────────────────────────────────────────\n";
    csv += `Árbitros:;${formatMoney(totales.egreso_arbitros)}\n`;
    csv += `Canchas:;${formatMoney(totales.egreso_canchas)}\n`;
    csv += `Profesores:;${formatMoney(totales.egreso_profesores)}\n`;
    csv += `Serv. Médico:;${formatMoney(totales.egreso_medico)}\n`;
    csv += `Otros Gastos:;${formatMoney(totales.egreso_otros)}\n`;
    csv += `TOTAL EGRESOS:;${formatMoney(totales.total_egresos)}\n\n`;

    csv += "═══════════════════════════════════════════════════════════════\n";
    csv += "                    RESUMEN FINAL DE CAJA\n";
    csv +=
      "═══════════════════════════════════════════════════════════════\n\n";
    csv += `Total Ingresos:;${formatMoney(totales.total_ingresos)}\n`;
    csv += `Total Egresos:;${formatMoney(totales.total_egresos)}\n`;
    csv += "───────────────────────────────────────────────────────────────\n";
    csv += `TOTAL CAJA:;${formatMoney(totales.total_caja)}\n`;
    csv += `EFECTIVO ESPERADO:;${formatMoney(totales.total_efectivo)}\n`;
    csv += `TRANSFERENCIAS/MP:;${formatMoney(totales.diferencia_caja)}\n`;

    if (planilla.totefectivo !== undefined && planilla.totefectivo !== null) {
      const diferencia = (planilla.totefectivo || 0) - totales.total_efectivo;
      csv += `EFECTIVO REAL:;${formatMoney(planilla.totefectivo)}\n`;
      csv += `DIFERENCIA:;${formatMoney(diferencia)}\n`;
    }

    if (planilla.observ_caja) {
      csv +=
        "\n───────────────────────────────────────────────────────────────\n";
      csv += `Observaciones:;${planilla.observ_caja}\n`;
    }

    csv +=
      "\n═══════════════════════════════════════════════════════════════\n";
    csv += `Exportado el:;${new Date().toLocaleString("es-AR")}\n`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=planilla_caja_${formatFecha(planilla.fecha).replace(
        /\//g,
        "-"
      )}_fecha${planilla.codfecha || idfecha}.csv`
    );

    return res.status(200).send("\uFEFF" + csv);
  } catch (error) {
    console.error("❌ Error al exportar planilla:", error);
    return res
      .status(500)
      .json({ message: "Error al exportar planilla.", error });
  }
};
