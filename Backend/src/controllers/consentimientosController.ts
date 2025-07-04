import { Request, Response } from "express";
import {
  getAllConsentimientos,
  getConsentimientoById,
  createConsentimiento,
  updateConsentimiento,
  deleteConsentimiento,
  IConsentimiento,
} from "../models/consentimientosModel";

export const getConsentimientos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : "";

    const { consentimientos, total } = await getAllConsentimientos(
      page,
      limit,
      searchTerm
    );
    return res.status(200).json({ consentimientos, total, page, limit });
  } catch (error) {
    console.error("❌ Error al obtener consentimientos:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener los consentimientos.", error });
  }
};

export const getConsentimiento = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const consentimiento = await getConsentimientoById(id);
    if (!consentimiento) {
      return res.status(404).json({ message: "Consentimiento no encontrado." });
    }

    return res.status(200).json(consentimiento);
  } catch (error) {
    console.error("❌ Error al obtener consentimiento:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener el consentimiento.", error });
  }
};

export const createConsentimientoController = async (
  req: Request,
  res: Response
) => {
  try {
    const consentimiento = req.body as IConsentimiento;

    if (!consentimiento.docnro) {
      return res
        .status(400)
        .json({ message: "El campo 'docnro' es obligatorio." });
    }

    const newConsentimiento = await createConsentimiento(consentimiento);

    return res.status(201).json({
      message: "Consentimiento creado exitosamente.",
      consentimiento: newConsentimiento,
    });
  } catch (error) {
    console.error("❌ Error al crear consentimiento:", error);
    return res
      .status(500)
      .json({ message: "Error al crear consentimiento.", error });
  }
};

export const updateConsentimientoController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const consentimientoActualizado = await updateConsentimiento(
      id,
      req.body as Partial<IConsentimiento>
    );

    if (!consentimientoActualizado) {
      return res.status(404).json({ message: "Consentimiento no encontrado." });
    }

    return res.status(200).json({
      message: "Consentimiento actualizado exitosamente.",
      consentimiento: consentimientoActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar consentimiento:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar consentimiento.", error });
  }
};

export const deleteConsentimientoController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const deleted = await deleteConsentimiento(id);

    if (!deleted) {
      return res.status(404).json({ message: "Consentimiento no encontrado." });
    }

    return res
      .status(200)
      .json({ message: "Consentimiento eliminado exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar consentimiento:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar consentimiento.", error });
  }
};
