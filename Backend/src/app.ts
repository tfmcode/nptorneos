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

app.listen(5001, "localhost", () => {
  console.log("Servidor corriendo en http://localhost:5001");
});

// Middleware para parsear JSON
app.use(express.json());

// Ruta base de prueba
app.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .send("Bienvenido al servidor backend. Todo funciona correctamente.");
});

// Rutas
app.use("/api/users", userRoutes); // Ahora las rutas estarán bajo "/api/users"
app.use("/api/championships", championshipRoutes); // Ahora las rutas estarán bajo "/api/users"

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

// Conexión a MongoDB
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nptorneosbackend";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log(`✅ Conectado a MongoDB en ${MONGO_URI}`))
  .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));

// Eventos de MongoDB
mongoose.connection.on("disconnected", () =>
  console.error("⚠️ Desconectado de MongoDB")
);
mongoose.connection.on("error", (err) =>
  console.error("❌ Error en la conexión a MongoDB:", err)
);

export default app;
