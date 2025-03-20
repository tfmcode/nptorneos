import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import express from "express";

export const applyMiddlewares = (app: express.Application) => {
  app.use(helmet()); // 🔒 Seguridad
  app.use(compression()); // 🚀 Compresión Gzip

  // ✅ **Middleware de CORS**
  const allowedOrigins = process.env.FRONTEND_URL?.split(",") || [
    "http://localhost:5173",
  ]; // Soporta múltiples orígenes
  app.use(
    cors({
      origin: allowedOrigins, // Permite solo los orígenes especificados en `.env`
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ✅ **Middleware para parsear JSON**
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // 🔹 Soporta formularios URL-encoded
};
