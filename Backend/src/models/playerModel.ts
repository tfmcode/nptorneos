import mongoose, { Schema, Document } from "mongoose";

interface IPlayer extends Document {
  firstName: string;
  lastName: string;
  document: string;
  birthday: Date;
  enabled: boolean;
  email?: string;
  phone?: string;
  twitter?: string;
  instagram?: string;
  weight?: number;
  height?: number;
  position?: string;
  goodLeg?: "left" | "right" | "both";
  team?: string;
  picture?: string;
  nickname?: string;
  category?: string;
}

const playerSchema = new Schema<IPlayer>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    document: { type: String, required: true, unique: true },
    birthday: { type: Date, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" },
    weight: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    position: { type: String, default: "" },
    goodLeg: { type: String, enum: ["left", "right", "both"], default: "both" },
    team: { type: String, default: "" },
    picture: { type: String, default: "" },
    nickname: { type: String, default: "" },
    category: { type: String, default: "" },
  },
  { timestamps: true }
);

const Player = mongoose.model<IPlayer>("Player", playerSchema);

export { Player, IPlayer };
