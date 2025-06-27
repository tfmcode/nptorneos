import { Request, Response } from "express";
import {
  getAllListaNegra,
  getListaNegraById,
  createListaNegra,
  updateListaNegra,
  deleteListaNegra,
} from "../models/listaNegraModel";

export const getListaNegra = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : "";

    const { registros, total } = await getAllListaNegra(
      page,
      limit,
      searchTerm
    );

    res.status(200).json({ registros, total, page, limit });
  } catch (error) {
    console.error("❌ Error en getListaNegra:", error);
    res
      .status(500)
      .json({ message: "Error al obtener registros de Lista Negra.", error });
  }
};

export const getRegistroListaNegra = async (req: Request, res: Response) => {
  try {
    const registro = await getListaNegraById(Number(req.params.id));
    if (!registro) {
      return res.status(404).json({ message: "Registro no encontrado." });
    }
    res.status(200).json(registro);
  } catch (error) {
    console.error("❌ Error en getRegistroListaNegra:", error);
    res.status(500).json({ message: "Error al obtener el registro.", error });
  }
};

export const createRegistroListaNegra = async (req: Request, res: Response) => {
  try {
    const nuevoRegistro = await createListaNegra(req.body);
    res.status(201).json({
      message: "Jugador agregado a Lista Negra exitosamente.",
      registro: nuevoRegistro,
    });
  } catch (error) {
    console.error("❌ Error en createRegistroListaNegra:", error);
    res.status(500).json({ message: "Error al agregar a Lista Negra.", error });
  }
};

export const updateRegistroListaNegra = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "ID de registro no válido." });
    }

    const registroActualizado = await updateListaNegra(id, req.body);
    if (!registroActualizado) {
      return res.status(404).json({ message: "Registro no encontrado." });
    }

    res.status(200).json({
      message: "Registro actualizado correctamente.",
      registro: registroActualizado,
    });
  } catch (error) {
    console.error("❌ Error en updateRegistroListaNegra:", error);
    res.status(500).json({ message: "Error al actualizar registro.", error });
  }
};

export const deleteRegistroListaNegra = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const eliminado = await deleteListaNegra(id);
    if (!eliminado) {
      return res
        .status(404)
        .json({ message: "Registro no encontrado o ya dado de baja." });
    }
    res
      .status(200)
      .json({ message: "Registro eliminado (baja lógica) correctamente." });
  } catch (error) {
    console.error("❌ Error en deleteRegistroListaNegra:", error);
    res.status(500).json({ message: "Error al eliminar registro.", error });
  }
};
