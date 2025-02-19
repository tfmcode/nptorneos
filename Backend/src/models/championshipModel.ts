import mongoose, { Schema, Document } from "mongoose";
import { Tournament } from "./tournamentModel"; // 🔥 IMPORTANTE: Registrar el modelo antes de usar populate()

interface IChampionship extends Document {
  name: string;
  sport: "Futbol" | "Otro";
  tournaments: mongoose.Types.ObjectId[];
  enabled: boolean;
}

const championshipSchema = new Schema<IChampionship>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    sport: {
      type: String,
      enum: ["Futbol", "Otro"],
      required: true,
    },
    tournaments: [{ type: Schema.Types.ObjectId, ref: "Tournament" }], // 🔗 Referencia a Tournament
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Championship = mongoose.model<IChampionship>(
  "Championship",
  championshipSchema
);

export { Championship, IChampionship };
