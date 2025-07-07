import { Request, Response } from "express";
import {
  getAllProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  IProveedor,
} from "../models/proveedoresModel";

export const getProveedores = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : "";

    const { proveedores, total } = await getAllProveedores(
      page,
      limit,
      searchTerm
    );
    return res.status(200).json({ proveedores, total, page, limit });
  } catch (error) {
    console.error("❌ Error al obtener proveedores:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener los proveedores.", error });
  }
};

export const getProveedor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const proveedor = await getProveedorById(id);
    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado." });
    }

    return res.status(200).json(proveedor);
  } catch (error) {
    console.error("❌ Error al obtener proveedor:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener el proveedor.", error });
  }
};

export const createProveedorController = async (
  req: Request,
  res: Response
) => {
  try {
    const proveedor = req.body as IProveedor;

    if (!proveedor.codtipo || !proveedor.nombre) {
      return res.status(400).json({
        message: "Los campos 'codtipo' y 'nombre' son obligatorios.",
      });
    }

    if (proveedor.codtipo === 4) {
      if (!proveedor.cuit || proveedor.cuit.trim() === "") {
        return res.status(400).json({
          message:
            "El campo 'cuit' es obligatorio para proveedores tipo OTROS.",
        });
      }
    }

    const newProveedor = await createProveedor(proveedor);

    return res.status(201).json({
      message: "Proveedor creado exitosamente.",
      proveedor: newProveedor,
    });
  } catch (error) {
    console.error("❌ Error al crear proveedor:", error);
    return res
      .status(500)
      .json({ message: "Error al crear proveedor.", error });
  }
};

export const updateProveedorController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const proveedor = req.body as Partial<IProveedor>;

    if (proveedor.codtipo === 4) {
      if (!proveedor.cuit || proveedor.cuit.trim() === "") {
        return res.status(400).json({
          message:
            "El campo 'cuit' es obligatorio para proveedores tipo OTROS.",
        });
      }
    }

    const proveedorActualizado = await updateProveedor(id, proveedor);

    if (!proveedorActualizado) {
      return res.status(404).json({ message: "Proveedor no encontrado." });
    }

    return res.status(200).json({
      message: "Proveedor actualizado exitosamente.",
      proveedor: proveedorActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar proveedor:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar proveedor.", error });
  }
};

export const deleteProveedorController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const deleted = await deleteProveedor(id);

    if (!deleted) {
      return res.status(404).json({ message: "Proveedor no encontrado." });
    }

    return res
      .status(200)
      .json({ message: "Proveedor eliminado exitosamente." });
  } catch (error) {
    console.error("❌ Error al eliminar proveedor:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar proveedor.", error });
  }
};
