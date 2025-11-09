import multer from "multer";
import path from "path";
import fs from "fs";

// Configurar el directorio de uploads
const uploadsDir = path.join(__dirname, "../../uploads");

// Crear directorio si no existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento en memoria (para procesamiento con Sharp)
const storage = multer.memoryStorage();

// Filtro de tipos de archivo permitidos
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de archivo no permitido. Solo se permiten: JPG, JPEG, PNG, WEBP"
      )
    );
  }
};

// Configuración de multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite inicial (se comprimirá después)
  },
});

export const UPLOADS_DIR = uploadsDir;
