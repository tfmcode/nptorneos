import mongoose, { Schema, Document } from "mongoose";

interface ITournament extends Document {
  name: string;
  championship: mongoose.Types.ObjectId;
  enabled: boolean;
}

const tournamentSchema = new Schema<ITournament>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    championship: { type: Schema.Types.ObjectId, ref: "Championship" },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Tournament = mongoose.model<ITournament>("Tournament", tournamentSchema);

export { Tournament, ITournament };
