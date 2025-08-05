import express, { Request, Response, ErrorRequestHandler } from "express";
import dotenv from "dotenv";
import path from "path";
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
import listaNegraRoutes from "./routes/listaNegraRoutes";
import proveedoresRoutes from "./routes/proveedoresRoutes";
import consentimientosRoutes from "./routes/consentimientosRoutes";
import sancionesRoutes from "./routes/sancionesRoutes";
import inscripcionesRoutes from "./routes/inscripcionesRoutes";
import inscripcionesJugadoresRoutes from "./routes/inscripcionesJugadoresRoutes";
import torneosEquiposInscRoutes from "./routes/torneosEquiposInscRoutes";
import menuTorneosRoutes from "./routes/menuTorneosRoutes";
import publicMenuTorneosRoutes from "./routes/publicMenuTorneosRoutes";
import publicTorneosRoutes from "./routes/publicTorneosRoutes";
import facturasRoutes from "./routes/facturasRoutes";
import comprobantesRoutes from "./routes/comprobantesRoutes";
import publicInscripcionesRoute from "./routes/publicInscripcionesRoute";
import partidosJugadoresRoute from "./routes/partidosJugadoresRoute";


dotenv.config();

const app = express();

applyMiddlewares(app);

app.use(
  "/assets",
  (req, res, next) => {
    if (!process.env.FRONTEND_URL) {
      console.error("⚠️ FRONTEND_URL environment variable is not set");
      return res.status(500).send("Server configuration error");
    }

    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  },
  express.static(path.join(__dirname, "../assets"))
);

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
app.use("/api/partidos", partidosJugadoresRoute);
app.use("/api/torneos-imagenes", torneosImagenesRoutes);
app.use("/api/equipos-jugadores", equiposJugadoresRoutes);
app.use("/api/lista-negra", listaNegraRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/consentimientos", consentimientosRoutes);
app.use("/api/sanciones", sancionesRoutes);
app.use("/api/inscripciones", inscripcionesRoutes);
app.use("/api/inscripciones-jugadores", inscripcionesJugadoresRoutes);
app.use("/api/torneos-equipos-insc", torneosEquiposInscRoutes);
app.use("/api/menutorneos", menuTorneosRoutes);
app.use("/api/public/menutorneos", publicMenuTorneosRoutes);
app.use("/api/public/torneos", publicTorneosRoutes);
app.use("/api/facturas", facturasRoutes);
app.use("/api/comprobantes", comprobantesRoutes);
app.use("/api/public/inscripciones", publicInscripcionesRoute);

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
