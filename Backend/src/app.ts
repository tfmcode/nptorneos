import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import userRoutes from "./routes/userRoutes";
import championshipRoutes from "./routes/championshipRoutes";
import playerRoutes from "./routes/playerRoutes";

dotenv.config();

const app = express();

// Middlewares de seguridad y optimización
app.use(helmet());
app.use(compression());

// Middleware de CORS
app.use(
  cors({
    origin: ["http://localhost:5173"], // Permite solo el frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// Middleware para parsear JSON
app.use(express.json());

// Ruta base de prueba
app.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .send("Bienvenido al servidor backend. Todo funciona correctamente.");
});

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/championships", championshipRoutes);
app.use("/api/players", playerRoutes);

// Manejo de rutas no definidas
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Middleware de manejo de errores
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
};

app.use(errorHandler);

export default app;
