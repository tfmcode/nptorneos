import dotenv from "dotenv";

dotenv.config(); // Cargar variables de entorno antes de cualquier otra cosa

import app from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 5001;

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ No se pudo iniciar el servidor:", err);
  });
