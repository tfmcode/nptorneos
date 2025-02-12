import mongoose, { Schema, Document } from "mongoose";
import "./tournamentModel"; // ✅ Importar para registrar el modelo de torneos en Mongoose

// 📌 Interfaz para tipado interno (opcional en controllers)
interface IChampionship extends Document {
  name: string;
  sport: "Futbol" | "Otro";
  tournaments: mongoose.Types.ObjectId[]; // Se asocian después de crear el campeonato
  enabled: boolean;
}

// 📌 Esquema del Campeonato
const championshipSchema = new Schema<IChampionship>(
  {
    name: { type: String, required: true },
    sport: { type: String, required: true },
    tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tournament" }], // ✅ Se pueden asociar después
    enabled: { type: Boolean, default: true }, // ✅ Por defecto activo
  },
  { timestamps: true }
);

// 📌 Modelo del Campeonato
const Championship = mongoose.model<IChampionship>(
  "Championship",
  championshipSchema
);

export { Championship, IChampionship }; // ✅ Exportamos ambos
