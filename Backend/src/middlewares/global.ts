import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import express from "express";

export const applyMiddlewares = (app: express.Application) => {
  // Seguridad básica
  app.use(helmet());

  // Compresión gzip para mejorar performance
  app.use(compression());

  // Orígenes permitidos en producción
  const allowedOrigins = [
    "https://nptorneos.com.ar",
    "https://www.nptorneos.com.ar",
  ];

  /* const allowedOrigins = process.env.FRONTEND_URL?.split(",") || [
    "http://localhost:5173",
  ]; */

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Habilita respuestas para preflight OPTIONS (evita error 405)
  app.options("*", cors());

  // Parsers estándar
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};
