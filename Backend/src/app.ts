import express, { Request, Response, ErrorRequestHandler } from "express";
import dotenv from "dotenv";
import { applyMiddlewares } from "./middlewares/global"; // ⬅️ Importa los middlewares globales
import usuariosRoutes from "./routes/usuariosRoutes";
import sedesRoutes from "./routes/sedesRoutes";
import campeonatosRoutes from "./routes/campeonatosRoutes";
import jugadoresRoutes from "./routes/jugadoresRoutes";

dotenv.config(); // ✅ Cargar variables de entorno

const app = express();

// ✅ **Aplica los Middlewares Globales desde `global.ts`**
applyMiddlewares(app);

// ✅ **Ruta base de prueba**
app.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ message: "Bienvenido al servidor backend con PostgreSQL. 🚀" });
});

// ✅ **Definición de Rutas**
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/sedes", sedesRoutes);
app.use("/api/campeonatos", campeonatosRoutes);
app.use("/api/jugadores", jugadoresRoutes);

// ✅ **Manejo de rutas no definidas**
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Ruta no encontrada." });
});

// ✅ **Middleware Global de Manejo de Errores**
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("❌ Error en el servidor:", err);

  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor.",
    error: process.env.NODE_ENV === "production" ? {} : err, // Oculta detalles en producción
  });
};

app.use(errorHandler);

export default app;
