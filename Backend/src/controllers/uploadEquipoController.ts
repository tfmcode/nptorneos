import { Request, Response } from "express";
import { imageService } from "../services/imageService";
import { pool } from "../config/db";

export const uploadEquipoImagen = async (req: Request, res: Response) => {
  const equipoId = parseInt(req.params.id);
  const client = await pool.connect();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionó ninguna imagen",
      });
    }

    await client.query("BEGIN");

    const equipoResult = await client.query(
      "SELECT id, nombre, foto FROM wequipos WHERE id = $1 AND fhbaja IS NULL FOR UPDATE",
      [equipoId]
    );

    if (equipoResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Equipo no encontrado",
      });
    }

    const equipoActual = equipoResult.rows[0];
    const fotoAnterior = equipoActual.foto;

    const nombreArchivo = `${equipoActual.nombre}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    const uploadResult = await imageService.replaceImage(
      fotoAnterior,
      req.file,
      nombreArchivo,
      {
        format: "jpeg",
        quality: 85,
      }
    );

    if (!uploadResult.success) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: uploadResult.error || "Error al procesar la imagen",
      });
    }

    const updateResult = await client.query(
      "UPDATE wequipos SET foto = $1, fhultmod = NOW() WHERE id = $2 AND fhbaja IS NULL RETURNING id, nombre, foto, fhultmod",
      [uploadResult.filename, equipoId]
    );

    if (updateResult.rows.length === 0) {
      await client.query("ROLLBACK");
      if (uploadResult.filename) {
        await imageService.deleteImage(uploadResult.filename);
      }
      return res.status(500).json({
        success: false,
        message: "Error al actualizar la base de datos",
      });
    }

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Imagen de equipo actualizada correctamente",
      data: {
        filename: uploadResult.filename,
        size: uploadResult.size,
        url: `/uploads/${uploadResult.filename}`,
      },
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("❌ Error al hacer rollback:", rollbackError);
    }

    console.error("❌ Error en uploadEquipoImagen:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al subir imagen",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    client.release();
  }
};

export const deleteEquipoImagen = async (req: Request, res: Response) => {
  const equipoId = parseInt(req.params.id);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const equipoResult = await client.query(
      "SELECT id, foto FROM wequipos WHERE id = $1 AND fhbaja IS NULL FOR UPDATE",
      [equipoId]
    );

    if (equipoResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Equipo no encontrado",
      });
    }

    const equipoActual = equipoResult.rows[0];
    const fotoActual = equipoActual.foto;

    if (!fotoActual) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "El equipo no tiene ninguna imagen asociada",
      });
    }

    await client.query(
      "UPDATE wequipos SET foto = NULL, fhultmod = NOW() WHERE id = $1 AND fhbaja IS NULL",
      [equipoId]
    );

    await client.query("COMMIT");

    const deleted = await imageService.deleteImage(fotoActual);

    return res.status(200).json({
      success: true,
      message: deleted
        ? "Imagen eliminada correctamente"
        : "Referencia eliminada (archivo no encontrado en servidor)",
      fileDeleted: deleted,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("❌ Error al hacer rollback:", rollbackError);
    }

    console.error("❌ Error en deleteEquipoImagen:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al eliminar imagen",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    client.release();
  }
};

export const getEquipoImagenInfo = async (req: Request, res: Response) => {
  const equipoId = parseInt(req.params.id);

  try {
    const equipoResult = await pool.query(
      "SELECT id, foto FROM wequipos WHERE id = $1 AND fhbaja IS NULL",
      [equipoId]
    );

    if (equipoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Equipo no encontrado",
      });
    }

    const equipoActual = equipoResult.rows[0];
    const fotoActual = equipoActual.foto;

    if (!fotoActual) {
      return res.status(200).json({
        success: true,
        hasImage: false,
        message: "El equipo no tiene imagen asociada",
      });
    }

    const imageInfo = await imageService.getImageInfo(fotoActual);

    if (!imageInfo.exists) {
      return res.status(200).json({
        success: true,
        hasImage: false,
        message: "Imagen no encontrada en el servidor",
        filename: fotoActual,
      });
    }

    return res.status(200).json({
      success: true,
      hasImage: true,
      data: {
        filename: fotoActual,
        url: `/uploads/${fotoActual}`,
        size: imageInfo.size,
        width: imageInfo.width,
        height: imageInfo.height,
        format: imageInfo.format,
      },
    });
  } catch (error) {
    console.error("❌ Error en getEquipoImagenInfo:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener información de la imagen",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
