import { Request, Response } from "express";
import {
  getTorneoImagenById,
  getTorneoImagenesByTorneo,
  createTorneoImagen,
  updateTorneoImagen,
  deleteTorneoImagen,
  getNextFileNumber,
} from "../models/torneosImagenesModel";

export const getTorneoImagenesByTorneoController = async (
  req: Request,
  res: Response
) => {
  try {
    const idTorneo = Number(req.params.idTorneo);
    const imagenes = await getTorneoImagenesByTorneo(idTorneo);

    if (!imagenes) {
      return res
        .status(404)
        .json({ message: "No se encontraron imágenes para este torneo." });
    }

    res.status(200).json(imagenes);
  } catch (error) {
    console.error("❌ Error al obtener las imágenes del torneo:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las imágenes del torneo.", error });
  }
};

export const getTorneoImagenController = async (
  req: Request,
  res: Response
) => {
  try {
    const imagen = await getTorneoImagenById(Number(req.params.id));

    if (!imagen) {
      return res
        .status(404)
        .json({ message: "Imagen de torneo no encontrada." });
    }

    res.status(200).json(imagen);
  } catch (error) {
    console.error("❌ Error al obtener imagen de torneo:", error);
    res
      .status(500)
      .json({ message: "Error al obtener la imagen de torneo.", error });
  }
};

export const createTorneoImagenController = async (
  req: Request,
  res: Response
) => {
  try {
    const imagen = req.body;
    const newImagen = await createTorneoImagen(imagen);

    return res.status(201).json({
      message: "Imagen de torneo creada exitosamente.",
      imagen: newImagen,
    });
  } catch (error) {
    console.error("❌ Error al crear imagen de torneo:", error);
    return res
      .status(500)
      .json({ message: "Error al crear imagen de torneo.", error });
  }
};

export const updateTorneoImagenController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const imagenActualizada = await updateTorneoImagen(id, req.body);

    if (!imagenActualizada) {
      return res
        .status(404)
        .json({ message: "Imagen de torneo no encontrada." });
    }

    return res.status(200).json({
      message: "Imagen de torneo actualizada exitosamente.",
      imagen: imagenActualizada,
    });
  } catch (error) {
    console.error("❌ Error al actualizar imagen de torneo:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar la imagen de torneo.", error });
  }
};

export const deleteTorneoImagenController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteTorneoImagen(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Imagen de torneo no encontrada." });
    }

    return res.status(200).json({
      message: "Imagen de torneo eliminada exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar imagen de torneo:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar la imagen de torneo.", error });
  }
};

export const uploadImageController = async (req: Request, res: Response) => {
  try {
    const fs = require("fs");
    const path = require("path");

    // Get the base64 data from request body
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image data is required" });
    }

    // Create directory if it doesn't exist
    const uploadDir = path.join(__dirname, "../../assets/wtorneos/files/");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Remove data:image/...;base64, prefix if present
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");

    const nextFileNumberFromFiles = await getNextFileNumberFromFiles();
    const nextFileNumberFromDB = await getNextFileNumber();

    const nextFileNumber = Math.max(
      nextFileNumberFromFiles,
      nextFileNumberFromDB
    );

    // Always use .webp extension for converted images
    const fileName = `arch${nextFileNumber}.webp`;

    // Save file as WebP
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, base64Data, "base64");

    res.json({
      message: "File uploaded successfully",
      fileName,
      ubicacion: `/assets/wtorneos/files/${fileName}`,
    });
  } catch (error) {
    console.error("❌ Error al subir archivo:", error);
    res.status(500).json({ error: "Error al subir el archivo." });
  }
};

const getNextFileNumberFromFiles = async () => {
  try {
    const fs = require("fs");
    const path = require("path");
    const dir = path.join(__dirname, "../../assets/wtorneos/files/");

    const files = fs.readdirSync(dir);
    const archFiles = files.filter((f: string) => f.startsWith("arch"));
    const numbers = archFiles.map((f: string) =>
      parseInt(f.match(/arch(\d+)/)?.[1] || "0")
    );
    const maxNum = Math.max(0, ...numbers);

    return maxNum + 1;
  } catch (error) {
    console.error("Error reading directory:", error);
    return 1;
  }
};
