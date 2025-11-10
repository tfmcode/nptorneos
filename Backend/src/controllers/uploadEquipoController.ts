// Backend/src/controllers/uploadEquipoController.ts

import { Request, Response } from "express";
import { imageService } from "../services/imageService";
import { pool } from "../config/db";

/**
 * 📸 SUBIR ESCUDO DE EQUIPO
 * Endpoint: POST /api/upload/equipo/:id/escudo
 */
export const uploadEquipoEscudo = async (req: Request, res: Response) => {
  const equipoId = parseInt(req.params.id);
  const client = await pool.connect();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionó ninguna imagen",
      });
    }

    console.log("📤 Iniciando upload de escudo:", {
      equipoId,
      originalName: req.file.originalname,
      size: `${(req.file.size / 1024).toFixed(2)}KB`,
    });

    await client.query("BEGIN");

    // Obtener datos del equipo
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

    const equipo = equipoResult.rows[0];
    const escudoAnterior = equipo.foto;

    // Eliminar escudo anterior si existe
    if (escudoAnterior) {
      await imageService.deleteImage(escudoAnterior, "equipos");
    }

    // Procesar y guardar nuevo escudo
    const uploadResult = await imageService.uploadEquipoEscudo(
      req.file,
      equipoId,
      equipo.nombre,
      {
        format: "jpeg",
        quality: 85,
      }
    );

    if (!uploadResult.success) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: uploadResult.error || "Error al procesar el escudo",
      });
    }

    // Actualizar base de datos
    const updateResult = await client.query(
      "UPDATE wequipos SET foto = $1, fhultmod = NOW() WHERE id = $2 RETURNING id, foto",
      [uploadResult.filename, equipoId]
    );

    if (updateResult.rows.length === 0) {
      await client.query("ROLLBACK");
      if (uploadResult.filename) {
        await imageService.deleteImage(uploadResult.filename, "equipos");
      }
      return res.status(500).json({
        success: false,
        message: "Error al actualizar la base de datos",
      });
    }

    await client.query("COMMIT");

    console.log("✅ Escudo de equipo actualizado:", {
      equipoId,
      filename: uploadResult.filename,
    });

    return res.status(200).json({
      success: true,
      message: "Escudo de equipo actualizado correctamente",
      data: {
        filename: uploadResult.filename,
        size: uploadResult.size,
        url: `/uploads/equipos/${uploadResult.filename}`,
      },
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("❌ Error al hacer rollback:", rollbackError);
    }

    console.error("❌ Error en uploadEquipoEscudo:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al subir escudo",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    client.release();
  }
};

/**
 * 🗑️ ELIMINAR ESCUDO DE EQUIPO
 * Endpoint: DELETE /api/upload/equipo/:id/escudo
 */
export const deleteEquipoEscudo = async (req: Request, res: Response) => {
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

    const escudoActual = equipoResult.rows[0].foto;

    if (!escudoActual) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "El equipo no tiene escudo asociado",
      });
    }

    // Actualizar base de datos
    await client.query(
      "UPDATE wequipos SET foto = NULL, fhultmod = NOW() WHERE id = $1",
      [equipoId]
    );

    await client.query("COMMIT");

    // Eliminar archivo físico
    const deleted = await imageService.deleteImage(escudoActual, "equipos");

    console.log("🗑️ Escudo de equipo eliminado:", {
      equipoId,
      filename: escudoActual,
      fileDeleted: deleted,
    });

    return res.status(200).json({
      success: true,
      message: deleted
        ? "Escudo eliminado correctamente"
        : "Referencia eliminada (archivo no encontrado)",
      fileDeleted: deleted,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("❌ Error al hacer rollback:", rollbackError);
    }

    console.error("❌ Error en deleteEquipoEscudo:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al eliminar escudo",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    client.release();
  }
};

/**
 * 📊 OBTENER INFORMACIÓN DEL ESCUDO
 * Endpoint: GET /api/upload/equipo/:id/escudo/info
 */
export const getEquipoEscudoInfo = async (req: Request, res: Response) => {
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

    const escudoActual = equipoResult.rows[0].foto;

    if (!escudoActual) {
      return res.status(200).json({
        success: true,
        hasImage: false,
        message: "El equipo no tiene escudo asociado",
      });
    }

    const imageInfo = await imageService.getImageInfo(escudoActual, "equipos");

    if (!imageInfo.exists) {
      return res.status(200).json({
        success: true,
        hasImage: false,
        message: "Escudo no encontrado en el servidor",
        filename: escudoActual,
      });
    }

    return res.status(200).json({
      success: true,
      hasImage: true,
      data: {
        filename: escudoActual,
        url: `/uploads/equipos/${escudoActual}`,
        size: imageInfo.size,
        width: imageInfo.width,
        height: imageInfo.height,
        format: imageInfo.format,
      },
    });
  } catch (error) {
    console.error("❌ Error en getEquipoEscudoInfo:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener información del escudo",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
