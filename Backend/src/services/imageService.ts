import sharp from "sharp";
import path from "path";
import fs from "fs";
import { UPLOADS_DIR } from "../config/multerConfig";

// ✅ Configuración de límites de imagen
export const IMAGE_CONFIG = {
  maxSizeBytes: 2 * 1024 * 1024, // 2MB después de compresión
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 85,
  allowedFormats: ["jpeg", "jpg", "png", "webp"],
};

// ✅ Interface para resultado de upload
export interface UploadResult {
  success: boolean;
  filename?: string;
  path?: string;
  size?: number;
  message?: string;
  error?: string;
}

// ✅ Interface para opciones de compresión
interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
}

/**
 * 🎯 SERVICIO GENÉRICO DE IMÁGENES
 * Maneja compresión, validación, guardado y eliminación de imágenes
 */
export class ImageService {
  private uploadsDir: string;

  constructor(uploadsDir: string = UPLOADS_DIR) {
    this.uploadsDir = uploadsDir;
    this.ensureUploadsDirExists();
  }

  /**
   * Asegurar que el directorio de uploads existe
   */
  private ensureUploadsDirExists(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Generar nombre único para archivo
   */
  private generateUniqueFilename(prefix: string, originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const ext = path.extname(originalName).toLowerCase();
    return `${prefix}_${timestamp}_${random}${ext}`;
  }

  /**
   * Validar buffer de imagen
   */
  private async validateImageBuffer(buffer: Buffer): Promise<void> {
    try {
      const metadata = await sharp(buffer).metadata();

      if (!metadata.format) {
        throw new Error("No se pudo determinar el formato de la imagen");
      }

      if (!IMAGE_CONFIG.allowedFormats.includes(metadata.format)) {
        throw new Error(
          `Formato no permitido: ${
            metadata.format
          }. Permitidos: ${IMAGE_CONFIG.allowedFormats.join(", ")}`
        );
      }
    } catch (error) {
      throw new Error(
        `Imagen inválida: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Comprimir y optimizar imagen
   */
  private async compressImage(
    buffer: Buffer,
    options: CompressionOptions = {}
  ): Promise<Buffer> {
    const {
      maxWidth = IMAGE_CONFIG.maxWidth,
      maxHeight = IMAGE_CONFIG.maxHeight,
      quality = IMAGE_CONFIG.quality,
      format = "jpeg",
    } = options;

    let sharpInstance = sharp(buffer);

    // Obtener metadata original
    const metadata = await sharpInstance.metadata();

    // Redimensionar si es necesario (manteniendo aspect ratio)
    if (
      metadata.width &&
      metadata.height &&
      (metadata.width > maxWidth || metadata.height > maxHeight)
    ) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Aplicar compresión según formato
    if (format === "jpeg") {
      sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
    } else if (format === "png") {
      sharpInstance = sharpInstance.png({
        quality,
        compressionLevel: 9,
      });
    } else if (format === "webp") {
      sharpInstance = sharpInstance.webp({ quality });
    }

    return await sharpInstance.toBuffer();
  }

  /**
   * Validar tamaño final de imagen
   */
  private validateFinalSize(buffer: Buffer): void {
    if (buffer.length > IMAGE_CONFIG.maxSizeBytes) {
      const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (IMAGE_CONFIG.maxSizeBytes / (1024 * 1024)).toFixed(2);
      throw new Error(
        `La imagen es demasiado grande (${sizeMB}MB). Máximo permitido: ${maxSizeMB}MB`
      );
    }
  }

  /**
   * 🚀 MÉTODO PRINCIPAL: Procesar y guardar imagen
   */
  public async processAndSaveImage(
    file: Express.Multer.File,
    prefix: string,
    options: CompressionOptions = {}
  ): Promise<UploadResult> {
    try {
      // 1. Validar buffer original
      await this.validateImageBuffer(file.buffer);

      // 2. Comprimir imagen
      const compressedBuffer = await this.compressImage(file.buffer, options);

      // 3. Validar tamaño final
      this.validateFinalSize(compressedBuffer);

      // 4. Generar nombre único
      const filename = this.generateUniqueFilename(prefix, file.originalname);
      const filepath = path.join(this.uploadsDir, filename);

      // 5. Guardar archivo
      await fs.promises.writeFile(filepath, compressedBuffer);

      // 6. Retornar resultado exitoso
      return {
        success: true,
        filename,
        path: filepath,
        size: compressedBuffer.length,
        message: "Imagen procesada y guardada correctamente",
      };
    } catch (error) {
      console.error("❌ Error al procesar imagen:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al procesar imagen",
      };
    }
  }

  /**
   * 🗑️ Eliminar imagen del sistema de archivos
   */
  public async deleteImage(filename: string): Promise<boolean> {
    try {
      if (!filename) {
        console.warn("⚠️ No se proporcionó nombre de archivo para eliminar");
        return false;
      }

      const filepath = path.join(this.uploadsDir, filename);

      // Verificar si el archivo existe
      if (!fs.existsSync(filepath)) {
        console.warn(`⚠️ Archivo no encontrado: ${filename}`);
        return false;
      }

      // Eliminar archivo
      await fs.promises.unlink(filepath);
      console.log(`✅ Imagen eliminada: ${filename}`);
      return true;
    } catch (error) {
      console.error("❌ Error al eliminar imagen:", error);
      return false;
    }
  }

  /**
   * 🔄 Reemplazar imagen antigua con nueva
   */
  public async replaceImage(
    oldFilename: string | null,
    newFile: Express.Multer.File,
    prefix: string,
    options: CompressionOptions = {}
  ): Promise<UploadResult> {
    try {
      // 1. Procesar y guardar nueva imagen
      const uploadResult = await this.processAndSaveImage(
        newFile,
        prefix,
        options
      );

      if (!uploadResult.success) {
        return uploadResult;
      }

      // 2. Eliminar imagen anterior si existe
      if (oldFilename) {
        await this.deleteImage(oldFilename);
      }

      return uploadResult;
    } catch (error) {
      console.error("❌ Error al reemplazar imagen:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error al reemplazar imagen",
      };
    }
  }

  /**
   * 📊 Obtener información de imagen
   */
  public async getImageInfo(filename: string): Promise<{
    exists: boolean;
    size?: number;
    width?: number;
    height?: number;
    format?: string;
  }> {
    try {
      const filepath = path.join(this.uploadsDir, filename);

      if (!fs.existsSync(filepath)) {
        return { exists: false };
      }

      const stats = await fs.promises.stat(filepath);
      const metadata = await sharp(filepath).metadata();

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
}

// ✅ Exportar instancia singleton
export const imageService = new ImageService();
