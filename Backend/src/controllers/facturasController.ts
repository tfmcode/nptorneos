import { Request, Response } from "express";
import {
  getAllFacturas,
  getFacturas,
  getFacturaById,
  createFactura,
  updateFactura,
  deleteFactura,
} from "../models/facturasModel";

export const getFacturasController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = (req.query.searchTerm as string) || "";
    const fechaDesde = req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : new Date("1900-01-01");
    const fechaHasta = req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : new Date("2099-12-31");
    
    const result = await getFacturas({
      page,
      limit,
      searchTerm,
      fechaDesde,
      fechaHasta,
    });
    
    res.status(200).json({
      facturas: result.facturas,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit), 
    });
  } catch (error) {
    console.error("❌ Error al obtener las facturas:", error);
    res.status(500).json({ message: "Error al obtener las facturas.", error });
  }
};

export const getFactura = async (req: Request, res: Response) => {
  try {
    const factura = await getFacturaById(Number(req.params.id));

    if (!factura) {
      return res.status(404).json({ message: "Factura no encontrada." });
    }

    res.status(200).json(factura);
  } catch (error) {
    console.error("❌ Error al obtener factura:", error);
    res.status(500).json({ message: "Error al obtener la factura.", error });
  }
};

export const createFacturaController = async (req: Request, res: Response) => {
  try {
    const factura = req.body;

    if (!factura.comprobante) {
      return res
        .status(400)
        .json({ message: "El comprobante es obligatorio." });
    }

    if (!factura.tipo) {
      return res
        .status(400)
        .json({ message: "El tipo de comprobante es obligatorio." });
    }

    if (!factura.proveedor) {
      return res
        .status(400)
        .json({ message: "El proveedor es obligatorio." });
    }

    if (!factura.formapago) {
      return res
        .status(400)
        .json({ message: "La forma de pago es obligatorio." });
    }

    const newFactura = await createFactura(factura);

    return res.status(201).json({
      message: "Factura creada exitosamente.",
      factura: newFactura,
    });
  } catch (error) {
    console.error("❌ Error al crear factura:", error);
    return res.status(500).json({ message: "Error al crear factura.", error });
  }
};

export const updateFacturaController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const facturaActualizada = await updateFactura(id, req.body);

    if (!facturaActualizada) {
      return res.status(404).json({ message: "Factura no encontrada." });
    }

    return res.status(200).json({
      message: "Factura actualizada exitosamente.",
      factura: facturaActualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar factura:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar la factura.", error });
  }
};

export const deleteFacturaController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteFactura(id);

    if (!deleted) {
      return res.status(404).json({ message: "Factura no encontrada." });
    }

    return res.status(200).json({
      message: "Factura eliminada exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar factura:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar la factura.", error });
  }
};
