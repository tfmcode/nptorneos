import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import express from "express";

export const applyMiddlewares = (app: express.Application) => {
  // Seguridad básica (permitimos recursos cross-origin si servís imágenes desde el backend)
  app.use(
    helmet({
      crossOriginResourcePolicy: false, // evita bloquear imágenes/archivos servidos a otro origen (p.ej. Vite)
    })
  );

  // Compresión gzip
  app.use(compression());

  // Orígenes permitidos (lee .env FRONTEND_URL y cae a localhost en dev)
  const envOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const defaultDevOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  const allowedOrigins = envOrigins.length ? envOrigins : defaultDevOrigins;

  // CORS con callback para aceptar solo orígenes permitidos y también requests sin Origin (curl/postman)
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // permite herramientas locales (curl, Postman)
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS bloqueado para origen: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Preflight explícito con misma config
  app.options("*", cors());

  // Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};
