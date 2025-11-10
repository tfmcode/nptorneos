// Backend/src/controllers/uploadEquipoGaleriaController.ts

import { Request, Response } from "express";
import { imageService } from "../services/imageService";
import { pool } from "../config/db";

/**
 * 📸 SUBIR FOTO GRUPAL DE EQUIPO
 * Endpoint: POST /api/upload/equipo/:id/galeria
 */
export const uploadFotoGrupal = async (req: Request, res: Response) => {
  const equipoId = parseInt(req.params.id);
  const client = await pool.connect();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionó ninguna imagen",
      });
    }

    console.log("📤 Iniciando upload de foto grupal:", {
      equipoId,
      originalName: req.file.originalname,
      size: `${(req.file.size / 1024).toFixed(2)}KB`,
    });

    await client.query("BEGIN");

    // Obtener datos del equipo
    const equipoResult = await client.query(
      "SELECT id, nombre FROM wequipos WHERE id = $1 AND fhbaja IS NULL FOR UPDATE",
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

    // Verificar cuántas fotos grupales ya tiene el equipo
    const countResult = await client.query(
      "SELECT COUNT(*) FROM wequipos_imagenes WHERE idequipo = $1 AND fhbaja IS NULL",
      [equipoId]
    );

    const fotoCount = parseInt(countResult.rows[0].count);

    if (fotoCount >= 2) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message:
          "El equipo ya tiene el máximo de 2 fotos grupales. Elimina una para subir otra.",
      });
    }

    // Determinar el orden de la nueva foto
    const orden = fotoCount + 1;

    // Procesar y guardar foto grupal
    const uploadResult = await imageService.uploadEquipoFotoGrupal(
      req.file,
      equipoId,
      equipo.nombre,
      orden,
      {
        format: "jpeg",
        quality: 85,
      }
    );

    if (!uploadResult.success) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: uploadResult.error || "Error al procesar la foto grupal",
      });
    }

    // Insertar en wequipos_imagenes
    const insertResult = await client.query(
      `INSERT INTO wequipos_imagenes 
       (idequipo, nombre, ubicacion, orden, fhcarga) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING *`,
      [
        equipoId,
        `Foto Grupal ${orden}`, // Nombre automático
        uploadResult.filename,
        orden,
      ]
    );

    if (insertResult.rows.length === 0) {
      await client.query("ROLLBACK");
      if (uploadResult.filename) {
        await imageService.deleteImage(uploadResult.filename, "equipos");
      }
      return res.status(500).json({
        success: false,
        message: "Error al registrar la foto en la base de datos",
      });
    }

    await client.query("COMMIT");

    console.log("✅ Foto grupal de equipo guardada:", {
      equipoId,
      filename: uploadResult.filename,
      orden,
    });

    return res.status(200).json({
      success: true,
      message: "Foto grupal subida correctamente",
      data: {
        id: insertResult.rows[0].idimagen,
        filename: uploadResult.filename,
        nombre: `Foto Grupal ${orden}`,
        orden,
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

    console.error("❌ Error en uploadFotoGrupal:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al subir foto grupal",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    client.release();
  }
};

/**
 * 📋 OBTENER FOTOS GRUPALES DEL EQUIPO
 * Endpoint: GET /api/upload/equipo/:id/galeria
 */
export const getFotosGrupales = async (req: Request, res: Response) => {
  const equipoId = parseInt(req.params.id);

  try {
    const result = await pool.query(
      `SELECT 
        idimagen, 
        nombre, 
        ubicacion, 
        orden, 
        TO_CHAR(fhcarga, 'YYYY-MM-DD HH24:MI:SS') as fhcarga
       FROM wequipos_imagenes 
       WHERE idequipo = $1 AND fhbaja IS NULL
       ORDER BY orden ASC`,
      [equipoId]
    );

    const fotos = result.rows.map((row) => ({
      id: row.idimagen,
      nombre: row.nombre,
      filename: row.ubicacion,
      url: `/uploads/equipos/${row.ubicacion}`,
      orden: row.orden,
      fhcarga: row.fhcarga,
    }));

    return res.status(200).json({
      success: true,
      data: fotos,
      total: fotos.length,
      maxAllowed: 2,
      canUploadMore: fotos.length < 2,
    });
  } catch (error) {
    console.error("❌ Error en getFotosGrupales:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener fotos grupales",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * 🗑️ ELIMINAR FOTO GRUPAL
 * Endpoint: DELETE /api/upload/equipo/:id/galeria/:imagenId
 */
export const deleteFotoGrupal = async (req: Request, res: Response) => {
  const equipoId = parseInt(req.params.id);
  const imagenId = parseInt(req.params.imagenId);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Obtener datos de la foto a eliminar
    const fotoResult = await client.query(
      `SELECT idimagen, ubicacion, orden 
       FROM wequipos_imagenes 
       WHERE idequipo = $1 AND idimagen = $2 AND fhbaja IS NULL 
       FOR UPDATE`,
      [equipoId, imagenId]
    );

    if (fotoResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Foto grupal no encontrada",
      });
    }

    const foto = fotoResult.rows[0];
    const ubicacion = foto.ubicacion;
    const ordenEliminado = foto.orden;

    // Marcar como eliminada (soft delete)
    await client.query(
      "UPDATE wequipos_imagenes SET fhbaja = NOW() WHERE idimagen = $1",
      [imagenId]
    );

    // Reordenar las fotos restantes
    await client.query(
      `UPDATE wequipos_imagenes 
       SET orden = orden - 1 
       WHERE idequipo = $1 
         AND orden > $2 
         AND fhbaja IS NULL`,
      [equipoId, ordenEliminado]
    );

    await client.query("COMMIT");

    // Eliminar archivo físico
    const deleted = await imageService.deleteImage(ubicacion, "equipos");

    console.log("🗑️ Foto grupal eliminada:", {
      equipoId,
      imagenId,
      filename: ubicacion,
      fileDeleted: deleted,
    });

    return res.status(200).json({
      success: true,
      message: deleted
        ? "Foto grupal eliminada correctamente"
        : "Referencia eliminada (archivo no encontrado)",
      fileDeleted: deleted,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("❌ Error al hacer rollback:", rollbackError);
    }

    console.error("❌ Error en deleteFotoGrupal:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al eliminar foto grupal",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    client.release();
  }
};

/**
 * 🔄 REORDENAR FOTOS GRUPALES
 * Endpoint: PUT /api/upload/equipo/:id/galeria/reorder
 */
export const reordenarFotosGrupales = async (req: Request, res: Response) => {
  const equipoId = parseInt(req.params.id);
  const { reorder } = req.body; // Array de { idimagen, orden }
  const client = await pool.connect();

  try {
    if (!Array.isArray(reorder) || reorder.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar un array de reordenamiento",
      });
    }

    await client.query("BEGIN");

    // Actualizar orden de cada foto
    for (const item of reorder) {
      await client.query(
        `UPDATE wequipos_imagenes 
         SET orden = $1, fhultmod = NOW() 
         WHERE idimagen = $2 AND idequipo = $3 AND fhbaja IS NULL`,
        [item.orden, item.idimagen, equipoId]
      );
    }

    await client.query("COMMIT");

    console.log("🔄 Fotos grupales reordenadas:", {
      equipoId,
      count: reorder.length,
    });

    return res.status(200).json({
      success: true,
      message: "Fotos reordenadas correctamente",
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("❌ Error al hacer rollback:", rollbackError);
    }

    console.error("❌ Error en reordenarFotosGrupales:", error);
    return res.status(500).json({
      success: false,
      message: "Error al reordenar fotos",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    client.release();
  }
};
