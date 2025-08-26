import { Request, Response } from "express";
import {
  getAllComprobantes,
  getComprobantes,
  getComprobanteByCodigo,
  getComprobanteVisible,
  createComprobante,
  updateComprobante,
  deleteComprobante,
  getComprobanteByModulo,
  Modulo
} from "../models/comprobantesModel";

export const getComprobantesController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = (req.query.searchTerm as string) || "";
    
    const result = await getComprobantes({
      page,
      limit,
      searchTerm
    });
    
    res.status(200).json({
      comprobantes: result.comprobantes,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit), 
    });
  } catch (error) {
    console.error("❌ Error al obtener las comprobantes:", error);
    res.status(500).json({ message: "Error al obtener las comprobantes.", error });
  }
};

export const getComprobanteModulo = async (req: Request, res: Response) => {
  try {
    const moduloParam = parseInt(req.params.modulo);

    if (!Object.values(Modulo).includes(moduloParam)) {
      return res.status(400).json({ message: "Módulo inválido." });
    }
    const comprobantes = await getComprobanteByModulo(moduloParam);

    if (!comprobantes) {
      return res.status(404).json({ message: "No se encontraron comprobantes para este módulo." });
    }

    res.status(200).json(comprobantes);
  } catch (error) {
    console.error("❌ Error al obtener comprobante:", error);
    res.status(500).json({ message: "Error al obtener el comprobante.", error });
  }
};

export const getComprobante = async (req: Request, res: Response) => {
  try {
    const comprobante = await getComprobanteByCodigo(req.params.codigo);

    if (!comprobante) {
      return res.status(404).json({ message: "Comprobante no encontrado." });
    }

    res.status(200).json(comprobante);
  } catch (error) {
    console.error("❌ Error al obtener comprobante:", error);
    res.status(500).json({ message: "Error al obtener el comprobante.", error });
  }
};

export const createComprobanteController = async (req: Request, res: Response) => {
  try {
    const comprobante = req.body;

    if (!comprobante.codigo) {
      return res
        .status(400)
        .json({ message: "El codigo es obligatorio." });
    }

    if (!comprobante.descripcion) {
      return res
        .status(400)
        .json({ message: "La descripción del comprobante es obligatorio." });
    }

    const newComprobante = await createComprobante(comprobante);

    return res.status(201).json({
      message: "Comprobante creado exitosamente.",
      comprobante: newComprobante,
    });
  } catch (error) {
    console.error("❌ Error al crear comprobante:", error);
    return res.status(500).json({ message: "Error al crear comprobante.", error });
  }
};

export const updateComprobanteController = async (req: Request, res: Response) => {
  try {
    const codigo = req.params.codigo;
    const comprobanteActualizado = await updateComprobante(codigo, req.body);

    if (!comprobanteActualizado) {
      return res.status(404).json({ message: "Comprobante no encontrado." });
    }

    return res.status(200).json({
      message: "Comprobante actualizado exitosamente.",
      comprobante: comprobanteActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar comprobante:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar el comprobante.", error });
  }
};

export const deleteComprobanteController = async (req: Request, res: Response) => {
  try {
    const codigo = req.params.id;
    const deleted = await deleteComprobante(codigo);

    if (!deleted) {
      return res.status(404).json({ message: "Comprobante no encontrado." });
    }

    return res.status(200).json({
      message: "Comprobante eliminado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar comprobante:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar la comprobante.", error });
  }
};
