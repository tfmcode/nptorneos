import { Request, Response } from "express";
import { imageService } from "../services/imageService";
import { pool } from "../config/db";

/**
 * 📸 SUBIR IMAGEN DE JUGADOR
 * Endpoint: POST /api/upload/jugador/:id
 *
 * ✅ MEJORAS IMPLEMENTADAS:
 * - Uso de transacciones para garantizar atomicidad
 * - Row-level locking (FOR UPDATE) para evitar race conditions
 * - Verificación post-commit para confirmar persistencia
 * - Mejor logging para debugging
 * - Cleanup automático en caso de error
 */
export const uploadJugadorImagen = async (req: Request, res: Response) => {
  const jugadorId = parseInt(req.params.id);
  const client = await pool.connect(); // ✅ Usar cliente con transacción

  try {
    // 1. Validar que existe el archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionó ninguna imagen",
      });
    }

    console.log("📤 Iniciando upload de imagen:", {
      jugadorId,
      originalName: req.file.originalname,
      size: `${(req.file.size / 1024).toFixed(2)}KB`,
      mimetype: req.file.mimetype,
    });

    // ✅ Iniciar transacción
    await client.query("BEGIN");

    // 2. Validar que existe el jugador y obtener sus datos (con FOR UPDATE para bloquear)
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

    const jugadorActual = jugadorResult.rows[0];
    const fotoAnterior = jugadorActual.foto;

    console.log("👤 Jugador encontrado:", {
      id: jugadorActual.id,
      nombre: `${jugadorActual.nombres} ${jugadorActual.apellido}`,
      fotoAnterior: fotoAnterior || "ninguna",
    });

    // ✅ Crear nombre de archivo usando nombre y apellido del jugador
    const nombreArchivo = `${jugadorActual.nombres}_${jugadorActual.apellido}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    console.log("📝 Nombre de archivo base generado:", nombreArchivo);

    // 3. Procesar y guardar nueva imagen (reemplazando la anterior si existe)
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

    console.log("💾 Imagen procesada:", {
      filename: uploadResult.filename,
      size: `${((uploadResult.size || 0) / 1024).toFixed(2)}KB`,
      path: uploadResult.path,
    });

    // 4. Actualizar base de datos con el nuevo nombre de archivo
    const updateResult = await client.query(
      "UPDATE jugadores SET foto = $1, fhultmod = NOW() WHERE id = $2 RETURNING id, nombres, apellido, foto, fhultmod",
      [uploadResult.filename, jugadorId]
    );

    if (updateResult.rows.length === 0) {
      console.error("❌ UPDATE no afectó ninguna fila");
      await client.query("ROLLBACK");
      // Eliminar la imagen guardada
      if (uploadResult.filename) {
        await imageService.deleteImage(uploadResult.filename);
      }
      return res.status(500).json({
        success: false,
        message: "Error al actualizar la base de datos",
      });
    }

    // ✅ Commit de la transacción
    await client.query("COMMIT");

    const jugadorActualizado = updateResult.rows[0];

    console.log("✅ BD actualizada y comiteada:", {
      id: jugadorActualizado.id,
      foto: jugadorActualizado.foto,
      fhultmod: jugadorActualizado.fhultmod,
    });

    // 5. Verificar que el cambio persistió (consulta independiente)
    const verificacion = await pool.query(
      "SELECT id, foto, fhultmod FROM jugadores WHERE id = $1",
      [jugadorId]
    );

    console.log("🔍 Verificación post-commit:", {
      foto: verificacion.rows[0]?.foto,
      persistio: verificacion.rows[0]?.foto === uploadResult.filename,
    });

    if (verificacion.rows[0]?.foto !== uploadResult.filename) {
      console.error(
        "⚠️ ADVERTENCIA: El valor no persistió correctamente en la BD"
      );
    }

    // 6. Retornar respuesta exitosa
    return res.status(200).json({
      success: true,
      message: "Imagen de jugador actualizada correctamente",
      data: {
        filename: uploadResult.filename,
        size: uploadResult.size,
        url: `/uploads/${uploadResult.filename}`,
      },
    });
  } catch (error) {
    // Rollback en caso de error
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
    // ✅ Siempre liberar el cliente
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

    // 1. Obtener información del jugador
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

    const jugadorActual = jugadorResult.rows[0];
    const fotoActual = jugadorActual.foto;

    if (!fotoActual) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "El jugador no tiene ninguna imagen asociada",
      });
    }

    // 2. Actualizar base de datos (eliminar referencia)
    await client.query(
      "UPDATE jugadores SET foto = NULL, fhultmod = NOW() WHERE id = $1",
      [jugadorId]
    );

    // 3. Commit de la transacción
    await client.query("COMMIT");

    // 4. Eliminar imagen del sistema de archivos (después del commit)
    const deleted = await imageService.deleteImage(fotoActual);

    console.log("🗑️ Imagen eliminada:", {
      jugadorId,
      filename: fotoActual,
      fileDeleted: deleted,
    });

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
    // 1. Obtener información del jugador
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

    const jugadorActual = jugadorResult.rows[0];
    const fotoActual = jugadorActual.foto;

    if (!fotoActual) {
      return res.status(200).json({
        success: true,
        hasImage: false,
        message: "El jugador no tiene imagen asociada",
      });
    }

    // 2. Obtener información de la imagen
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
    console.error("❌ Error en getJugadorImagenInfo:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener información de la imagen",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
