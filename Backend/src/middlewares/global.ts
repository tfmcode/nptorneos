import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import express from "express";
import { globalLimiter } from "../config/rateLimitConfig";

export const applyMiddlewares = (app: express.Application) => {
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

  app.use(compression());

  app.use(globalLimiter);

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

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS bloqueado para origen: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.options("*", cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};
