import app from "./app";

const PORT = Number(process.env.PORT) || 5001; // ✅ Conversión a número

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
