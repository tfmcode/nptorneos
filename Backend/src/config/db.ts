import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nptorneosbackend";
    await mongoose.connect(MONGO_URI);
    console.log(`✅ Conectado a MongoDB en ${MONGO_URI}`);
  } catch (err: any) {
    // Asegurar que err tiene mensaje
    console.error("❌ Error al conectar a MongoDB:", err.message);
    process.exit(1);
  }
};

// Eventos de MongoDB
mongoose.connection.on("disconnected", () =>
  console.error("⚠️ Desconectado de MongoDB")
);
mongoose.connection.on("error", (err) =>
  console.error("❌ Error en la conexión a MongoDB:", err.message)
);

export default connectDB;
