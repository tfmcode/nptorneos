import mongoose, { Schema, Document } from "mongoose";

// Interfaz para tipar un documento de usuario
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
}

// Esquema de usuario
const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
  }
);

// Modelo de usuario
const User = mongoose.model<IUser>("User", userSchema);

export default User;
