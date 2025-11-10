// Backend/src/controllers/uploadController.ts

import { Request, Response } from "express";
import { imageService } from "../services/imageService";
import { pool } from "../config/db";

/**
 * 📸 SUBIR IMAGEN DE JUGADOR
 * Endpoint: POST /api/upload/jugador/:id
 */
export const uploadJugadorImagen = async (req: Request, res: Response) => {
  const jugadorId = parseInt(req.params.id);
  const client = await pool.connect();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionó ninguna imagen",
      });
    }

    console.log("📤 Iniciando upload de imagen de jugador:", {
      jugadorId,
      originalName: req.file.originalname,
      size: `${(req.file.size / 1024).toFixed(2)}KB`,
    });

    await client.query("BEGIN");

    // Obtener datos del jugador
    const jugadorResult = await client.query(
      "SELECT id, nombres, apellido, foto FROM jugadores WHERE id = $1 AND fhbaja IS NULL FOR UPDATE",
      [jugadorId]
    );

    if (jugadorResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado",
      });
    }

    const jugador = jugadorResult.rows[0];
    const fotoAnterior = jugador.foto;

    // Generar nombre base para el archivo
    const nombreBase = `${jugador.nombres}_${jugador.apellido}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    // Eliminar foto anterior si existe
    if (fotoAnterior) {
      await imageService.deleteImage(fotoAnterior, "jugadores");
    }

    // Procesar y guardar nueva imagen
    const uploadResult = await imageService.uploadJugadorImage(
      req.file,
      nombreBase,
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

    // Actualizar base de datos
    const updateResult = await client.query(
      "UPDATE jugadores SET foto = $1, fhultmod = NOW() WHERE id = $2 RETURNING id, foto",
      [uploadResult.filename, jugadorId]
    );

    if (updateResult.rows.length === 0) {
      await client.query("ROLLBACK");
      if (uploadResult.filename) {
        await imageService.deleteImage(uploadResult.filename, "jugadores");
      }
      return res.status(500).json({
        success: false,
        message: "Error al actualizar la base de datos",
      });
    }

    await client.query("COMMIT");

    console.log("✅ Imagen de jugador actualizada:", {
      jugadorId,
      filename: uploadResult.filename,
    });

    return res.status(200).json({
      success: true,
      message: "Imagen de jugador actualizada correctamente",
      data: {
        filename: uploadResult.filename,
        size: uploadResult.size,
        url: `/uploads/jugadores/${uploadResult.filename}`,
      },
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("❌ Error al hacer rollback:", rollbackError);
    }

    console.error("❌ Error en uploadJugadorImagen:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al subir imagen",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    client.release();
  }
};

/**
 * 🗑️ ELIMINAR IMAGEN DE JUGADOR
 * Endpoint: DELETE /api/upload/jugador/:id
 */
export const deleteJugadorImagen = async (req: Request, res: Response) => {
  const jugadorId = parseInt(req.params.id);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const jugadorResult = await client.query(
      "SELECT id, foto FROM jugadores WHERE id = $1 AND fhbaja IS NULL FOR UPDATE",
      [jugadorId]
    );

    if (jugadorResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado",
      });
    }

    const fotoActual = jugadorResult.rows[0].foto;

    if (!fotoActual) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "El jugador no tiene ninguna imagen asociada",
      });
    }

    // Actualizar base de datos
    await client.query(
      "UPDATE jugadores SET foto = NULL, fhultmod = NOW() WHERE id = $1",
      [jugadorId]
    );

    await client.query("COMMIT");

    // Eliminar archivo físico
    const deleted = await imageService.deleteImage(fotoActual, "jugadores");

    console.log("🗑️ Imagen de jugador eliminada:", {
      jugadorId,
      filename: fotoActual,
      fileDeleted: deleted,
    });

    return res.status(200).json({
      success: true,
      message: deleted
        ? "Imagen eliminada correctamente"
        : "Referencia eliminada (archivo no encontrado)",
      fileDeleted: deleted,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("❌ Error al hacer rollback:", rollbackError);
    }

    console.error("❌ Error en deleteJugadorImagen:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al eliminar imagen",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    client.release();
  }
};

/**
 * 📊 OBTENER INFORMACIÓN DE IMAGEN DE JUGADOR
 * Endpoint: GET /api/upload/jugador/:id/info
 */
export const getJugadorImagenInfo = async (req: Request, res: Response) => {
  const jugadorId = parseInt(req.params.id);

  try {
    const jugadorResult = await pool.query(
      "SELECT id, foto FROM jugadores WHERE id = $1 AND fhbaja IS NULL",
      [jugadorId]
    );

    if (jugadorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado",
      });
    }

    const fotoActual = jugadorResult.rows[0].foto;

    if (!fotoActual) {
      return res.status(200).json({
        success: true,
        hasImage: false,
        message: "El jugador no tiene imagen asociada",
      });
    }

    const imageInfo = await imageService.getImageInfo(fotoActual, "jugadores");

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
        url: `/uploads/jugadores/${fotoActual}`,
        size: imageInfo.size,
        width: imageInfo.width,
        height: imageInfo.height,
        format: imageInfo.format,
      },
    });
  } catch (error) {
    console.error("❌ Error en getJugadorImagenInfo:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener información de la imagen",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
