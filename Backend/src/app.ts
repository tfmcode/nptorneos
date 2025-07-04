import express, { Request, Response, ErrorRequestHandler } from "express";
import dotenv from "dotenv";
import { applyMiddlewares } from "./middlewares/global";
import usuariosRoutes from "./routes/usuariosRoutes";
import sedesRoutes from "./routes/sedesRoutes";
import campeonatosRoutes from "./routes/campeonatosRoutes";
import jugadoresRoutes from "./routes/jugadoresRoutes";
import codificadoresRoutes from "./routes/codificadoresRoutes";
import equiposRoutes from "./routes/equiposRoutes";
import torneosRoutes from "./routes/torneosRoutes";
import zonasRoutes from "./routes/zonasRoutes";
import zonasEquiposRoutes from "./routes/zonasEquiposRoutes";
import partidosRoutes from "./routes/partidosRoutes";
import torneosImagenesRoutes from "./routes/torneosImagenesRoutes";
import equiposJugadoresRoutes from "./routes/equiposJugadoresRoutes";

dotenv.config();

const app = express();

applyMiddlewares(app);

app.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ message: "Bienvenido al servidor backend con PostgreSQL. 🚀" });
});

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/sedes", sedesRoutes);
app.use("/api/campeonatos", campeonatosRoutes);
app.use("/api/jugadores", jugadoresRoutes);
app.use("/api/codificadores", codificadoresRoutes);
app.use("/api/equipos", equiposRoutes);
app.use("/api/torneos", torneosRoutes);
app.use("/api/zonas", zonasRoutes);
app.use("/api/zonas-equipos", zonasEquiposRoutes);
app.use("/api/partidos", partidosRoutes);
app.use("/api/torneos-imagenes", torneosImagenesRoutes);
app.use("/api/equipos-jugadores", equiposJugadoresRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Ruta no encontrada." });
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("❌ Error en el servidor:", err);

  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor.",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
};

app.use(errorHandler);

export default app;
