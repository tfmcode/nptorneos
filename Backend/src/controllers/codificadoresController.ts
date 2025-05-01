// codificadoresController.ts
import { Request, Response } from "express";
import {
  getAllCodificadores,
  getCodificadorById,
  createCodificador,
  updateCodificador,
  deleteCodificador,
} from "../models/codificadoresModel";

export const getCodificadores = async (req: Request, res: Response) => {
  try {
    const codificadores = await getAllCodificadores();
    res.status(200).json(codificadores);
  } catch (error) {
    console.error("❌ Error al obtener los codificadores:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los codificadores.", error });
  }
};

export const createCodificadorController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, ...codificador } = req.body;

    const nuevoCodificador = await createCodificador(codificador);
    return res.status(201).json({
      message: "Codificador creado exitosamente.",
      codificador: nuevoCodificador,
    });
  } catch (error) {
    console.error("❌ Error al crear codificador:", error);
    return res
      .status(500)
      .json({ message: "Error al crear codificador.", error });
  }
};

export const updateCodificadorController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const idcodificador = Number(req.params.idcodificador);
    const codificadorActualizado = await updateCodificador(
      id,
      idcodificador,
      req.body
    );

    if (!codificadorActualizado) {
      return res.status(404).json({ message: "Codificador no encontrado." });
    }

    return res.status(200).json({
      message: "Codificador actualizado exitosamente.",
      codificador: codificadorActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar codificador:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar el codificador.", error });
  }
};

export const deleteCodificadorController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const idcodificador = Number(req.params.idcodificador);
    const deleted = await deleteCodificador(id, idcodificador);

    if (!deleted) {
      return res.status(404).json({ message: "Codificador no encontrado." });
    }

    return res.status(200).json({
      message: "Codificador eliminado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar codificador:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar el codificador.", error });
  }
};

