import { Request, Response } from "express";
import {
  getAllCajaMovimiento,
  getCajaMovimientos,
  getCajaMovimientoById,
  createCajaMovimiento,
  updateCajaMovimiento,
  deleteCajaMovimiento,
  getCajaMovimientoFacturasPendientes,
} from "../models/cajamovimientosModel";

export const getCajaMovimientosController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = (req.query.searchTerm as string) || "";
    const fechaDesde = req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : new Date("1900-01-01");
    const fechaHasta = req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : new Date("2099-12-31");
    
    const result = await getCajaMovimientos({
      page,
      limit,
      searchTerm,
      fechaDesde,
      fechaHasta,
    });
    
    res.status(200).json({
      cajamovimientos: result.cajamovimientos,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit), 
    });
  } catch (error) {
    console.error("❌ Error al obtener los movimientos de caja:", error);
    res.status(500).json({ message: "Error al obtener los movimientos de caja.", error });
  }
};

export const getCajaMovimiento = async (req: Request, res: Response) => {
  try {
    const factura = await getCajaMovimientoById(Number(req.params.id));

    if (!factura) {
      return res.status(404).json({ message: "Movimiento de caja no encontrado." });
    }

    res.status(200).json(factura);
  } catch (error) {
    console.error("❌ Error al obtener el movimiento de caja:", error);
    res.status(500).json({ message: "Error al obtener el movimiento de caja.", error });
  }
};

export const createCajaMovimientoController = async (req: Request, res: Response) => {
  try {
    const cajamovimiento = req.body;

    if (!cajamovimiento.comprobante) {
      return res
        .status(400)
        .json({ message: "El comprobante es obligatorio." });
    }

    if (!cajamovimiento.proveedor) {
      return res
        .status(400)
        .json({ message: "El proveedor es obligatorio." });
    }

    const newCajaMovimiento = await createCajaMovimiento(cajamovimiento);

    return res.status(201).json({
      message: "Movimiento de caja creado exitosamente.",
      cajamovimiento: newCajaMovimiento,
    });
  } catch (error) {
    console.error("❌ Error al crear movimiento de caja:", error);
    return res.status(500).json({ message: "Error al crear movimiento de caja.", error });
  }
};

export const updateCajaMovimientoController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const cajamovimientoActualizada = await updateCajaMovimiento(id, req.body);

    if (!cajamovimientoActualizada) {
      return res.status(404).json({ message: "Movimiento de caja no encontrado." });
    }

    return res.status(200).json({
      message: "Movimiento de caja actualizado exitosamente.",
      cajamovimiento: cajamovimientoActualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar movimiento de caja:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar el movimiento de caja.", error });
  }
};

export const deleteCajaMovimientoController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteCajaMovimiento(id);

    if (!deleted) {
      return res.status(404).json({ message: "Movimiento de caja no encontrada." });
    }

    return res.status(200).json({
      message: "Movimiento de caja eliminado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar movimiento de caja:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar el movimiento de caja.", error });
  }
};

export const getCajaMovimientoFacturasPendientesController = async (req: Request, res: Response) => {
  try {
    const proveedor = req.params.proveedor;
    const dc = req.query.dc ? Number(req.query.dc) : undefined;
    const facturas = await getCajaMovimientoFacturasPendientes(proveedor, dc);
    return res.status(200).json(facturas);
  } catch (error) {
    console.error("❌ Error en getFacturasPendientesController:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener facturas pendientes", error });
  }
};