import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import express from "express";

export const applyMiddlewares = (app: express.Application) => {
  app.use(helmet());
  app.use(compression());

  const allowedOrigins = process.env.FRONTEND_URL?.split(",") || [
    "http://localhost:5173",
  ];
  app.use(
    cors({
      origin: allowedOrigins, 
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};
