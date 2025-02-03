import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // Importar el paquete cors
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();

// Middleware de CORS: Permitir solicitudes desde el frontend
app.use(
  cors({
    origin: "http://localhost:5173", // Permite solicitudes desde el frontend en este origen
  })
);

// Middlewares
app.use(express.json());

// Ruta base de prueba
app.get("/", (req, res) => {
  res
    .status(200)
    .send("Bienvenido al servidor backend. Todo funciona correctamente.");
});

// Rutas de usuarios
app.use("/api/users", userRoutes);
app.use("/api", userRoutes);


// Conexión a MongoDB
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nptorneosbackend";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log(`Conectado a MongoDB en ${MONGO_URI}`))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

export default app;
