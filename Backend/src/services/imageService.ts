// Backend/src/services/imageService.ts

import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

/**
 * 📁 CONFIGURACIÓN DE CARPETAS
 */
const UPLOADS_BASE_DIR = path.join(__dirname, "../../uploads");

const UPLOAD_DIRS = {
  jugadores: path.join(UPLOADS_BASE_DIR, "jugadores"),
  equipos: path.join(UPLOADS_BASE_DIR, "equipos"),
  arbitros: path.join(UPLOADS_BASE_DIR, "arbitros"),
} as const;

type EntityType = keyof typeof UPLOAD_DIRS;

/**
 * 🎨 OPCIONES DE PROCESAMIENTO DE IMAGEN
 */
interface ImageProcessingOptions {
  format?: "jpeg" | "png" | "webp";
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * 📊 RESULTADO DE OPERACIÓN DE IMAGEN
 */
interface ImageOperationResult {
  success: boolean;
  filename?: string;
  path?: string;
  size?: number;
  error?: string;
}

/**
 * 📷 INFORMACIÓN DE IMAGEN
 */
interface ImageInfo {
  exists: boolean;
  size?: number;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * 🚀 SERVICIO DE GESTIÓN DE IMÁGENES
 */
class ImageService {
  /**
   * 📁 Crear directorios necesarios
   */
  private async ensureDirectories(): Promise<void> {
    for (const dir of Object.values(UPLOAD_DIRS)) {
      if (!existsSync(dir)) {
        await fs.mkdir(dir, { recursive: true });
        console.log(`✅ Directorio creado: ${dir}`);
      }
    }
  }

  /**
   * 📂 Crear carpeta específica para un equipo
   */
  private async ensureTeamDirectory(teamSlug: string): Promise<string> {
    const teamDir = path.join(UPLOAD_DIRS.equipos, teamSlug);
    if (!existsSync(teamDir)) {
      await fs.mkdir(teamDir, { recursive: true });
      console.log(`✅ Carpeta de equipo creada: ${teamDir}`);
    }
    return teamDir;
  }

  /**
   * 🔄 Convertir nombre de equipo a slug
   */
  private teamNameToSlug(teamName: string): string {
    return teamName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  /**
   * 🖼️ Procesar y guardar imagen
   */
  private async processAndSaveImage(
    buffer: Buffer,
    outputPath: string,
    options: ImageProcessingOptions = {}
  ): Promise<{ size: number }> {
    const {
      format = "jpeg",
      quality = 85,
      maxWidth = 2000,
      maxHeight = 2000,
    } = options;

    let pipeline = sharp(buffer).rotate(); // Auto-rotate basado en EXIF

    // Redimensionar si excede límites
    const metadata = await sharp(buffer).metadata();
    if (
      metadata.width &&
      metadata.height &&
      (metadata.width > maxWidth || metadata.height > maxHeight)
    ) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Aplicar formato y calidad
    if (format === "jpeg") {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    } else if (format === "png") {
      pipeline = pipeline.png({ quality, compressionLevel: 9 });
    } else if (format === "webp") {
      pipeline = pipeline.webp({ quality });
    }

    // Guardar archivo
    await pipeline.toFile(outputPath);

    // Obtener tamaño del archivo generado
    const stats = await fs.stat(outputPath);
    return { size: stats.size };
  }

  /**
   * 📤 SUBIR IMAGEN DE JUGADOR
   */
  async uploadJugadorImage(
    file: Express.Multer.File,
    baseFilename: string,
    options?: ImageProcessingOptions
  ): Promise<ImageOperationResult> {
    try {
      await this.ensureDirectories();

      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 9);
      const extension = options?.format || "jpg";
      const filename = `${baseFilename}_${timestamp}_${randomSuffix}.${extension}`;
      const outputPath = path.join(UPLOAD_DIRS.jugadores, filename);

      const { size } = await this.processAndSaveImage(
        file.buffer,
        outputPath,
        options
      );

      console.log("✅ Imagen de jugador guardada:", {
        filename,
        size: `${(size / 1024).toFixed(2)}KB`,
      });

      return {
        success: true,
        filename,
        path: outputPath,
        size,
      };
    } catch (error) {
      console.error("❌ Error al procesar imagen de jugador:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * 📤 SUBIR ESCUDO DE EQUIPO
   */
  async uploadEquipoEscudo(
    file: Express.Multer.File,
    teamId: number,
    teamName: string,
    options?: ImageProcessingOptions
  ): Promise<ImageOperationResult> {
    try {
      await this.ensureDirectories();

      const teamSlug = this.teamNameToSlug(teamName);
      const teamDir = await this.ensureTeamDirectory(teamSlug);

      // Nombre fijo para el escudo
      const extension = options?.format || "jpg";
      const filename = `escudo.${extension}`;
      const outputPath = path.join(teamDir, filename);

      // Si existe escudo anterior, eliminarlo
      if (existsSync(outputPath)) {
        await fs.unlink(outputPath);
        console.log("🗑️ Escudo anterior eliminado");
      }

      const { size } = await this.processAndSaveImage(
        file.buffer,
        outputPath,
        options
      );

      // Retornar ruta relativa desde uploads/equipos/
      const relativeFilename = `${teamSlug}/escudo.${extension}`;

      console.log("✅ Escudo de equipo guardado:", {
        filename: relativeFilename,
        size: `${(size / 1024).toFixed(2)}KB`,
      });

      return {
        success: true,
        filename: relativeFilename,
        path: outputPath,
        size,
      };
    } catch (error) {
      console.error("❌ Error al procesar escudo de equipo:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * 📤 SUBIR FOTO GRUPAL DE EQUIPO
   */
  async uploadEquipoFotoGrupal(
    file: Express.Multer.File,
    teamId: number,
    teamName: string,
    orden: number,
    options?: ImageProcessingOptions
  ): Promise<ImageOperationResult> {
    try {
      await this.ensureDirectories();

      const teamSlug = this.teamNameToSlug(teamName);
      const teamDir = await this.ensureTeamDirectory(teamSlug);

      const timestamp = Date.now();
      const extension = options?.format || "jpg";
      const filename = `grupo_foto${orden}_${timestamp}.${extension}`;
      const outputPath = path.join(teamDir, filename);

      const { size } = await this.processAndSaveImage(
        file.buffer,
        outputPath,
        options
      );

      // Retornar ruta relativa desde uploads/equipos/
      const relativeFilename = `${teamSlug}/${filename}`;

      console.log("✅ Foto grupal de equipo guardada:", {
        filename: relativeFilename,
        orden,
        size: `${(size / 1024).toFixed(2)}KB`,
      });

      return {
        success: true,
        filename: relativeFilename,
        path: outputPath,
        size,
      };
    } catch (error) {
      console.error("❌ Error al procesar foto grupal:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * 🔄 REEMPLAZAR IMAGEN (mantener compatibilidad con código existente)
   */
  async replaceImage(
    oldFilename: string | null,
    file: Express.Multer.File,
    baseFilename: string,
    options?: ImageProcessingOptions
  ): Promise<ImageOperationResult> {
    // Determinar tipo de entidad por la ruta del archivo anterior
    let entityType: EntityType = "jugadores"; // Por defecto

    if (oldFilename) {
      if (oldFilename.includes("/")) {
        // Es un equipo (tiene carpeta)
        entityType = "equipos";
      }
    }

    // Eliminar archivo anterior si existe
    if (oldFilename) {
      await this.deleteImage(oldFilename, entityType);
    }

    // Subir nueva imagen (por ahora solo jugadores usan esta función)
    return this.uploadJugadorImage(file, baseFilename, options);
  }

  /**
   * 🗑️ ELIMINAR IMAGEN
   */
  async deleteImage(
    filename: string,
    entityType: EntityType = "jugadores"
  ): Promise<boolean> {
    try {
      const filePath = path.join(UPLOAD_DIRS[entityType], filename);

      if (existsSync(filePath)) {
        await fs.unlink(filePath);
        console.log("🗑️ Imagen eliminada:", filePath);
        return true;
      }

      console.log("⚠️ Imagen no encontrada:", filePath);
      return false;
    } catch (error) {
      console.error("❌ Error al eliminar imagen:", error);
      return false;
    }
  }

  /**
   * 🗑️ ELIMINAR CARPETA DE EQUIPO COMPLETA
   */
  async deleteTeamDirectory(teamName: string): Promise<boolean> {
    try {
      const teamSlug = this.teamNameToSlug(teamName);
      const teamDir = path.join(UPLOAD_DIRS.equipos, teamSlug);

      if (existsSync(teamDir)) {
        await fs.rm(teamDir, { recursive: true, force: true });
        console.log("🗑️ Carpeta de equipo eliminada:", teamDir);
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Error al eliminar carpeta de equipo:", error);
      return false;
    }
  }

  /**
   * 📊 OBTENER INFORMACIÓN DE IMAGEN
   */
  async getImageInfo(
    filename: string,
    entityType: EntityType = "jugadores"
  ): Promise<ImageInfo> {
    try {
      const filePath = path.join(UPLOAD_DIRS[entityType], filename);

      if (!existsSync(filePath)) {
        return { exists: false };
      }

      const stats = await fs.stat(filePath);
      const metadata = await sharp(filePath).metadata();

      return {
        exists: true,
        size: stats.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      };
    } catch (error) {
      console.error("❌ Error al obtener info de imagen:", error);
      return { exists: false };
    }
  }

  /**
   * 📋 LISTAR FOTOS GRUPALES DE UN EQUIPO
   */
  async listTeamGallery(teamName: string): Promise<string[]> {
    try {
      const teamSlug = this.teamNameToSlug(teamName);
      const teamDir = path.join(UPLOAD_DIRS.equipos, teamSlug);

      if (!existsSync(teamDir)) {
        return [];
      }

      const files = await fs.readdir(teamDir);

      // Filtrar solo fotos grupales (excluir escudo)
      const galleryPhotos = files
        .filter((file) => file.startsWith("grupo_foto"))
        .sort(); // Ordenar por nombre (incluye timestamp)

      return galleryPhotos;
    } catch (error) {
      console.error("❌ Error al listar galería de equipo:", error);
      return [];
    }
  }
}

// Exportar instancia única
export const imageService = new ImageService();
