import mongoose, { Schema, Document } from "mongoose";

// Interfaz para tipar un documento de usuario
export interface User extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "admin" | "staff" | "user";
  enabled: boolean;
}

// Esquema de usuario
const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff", "user"], required: true },
    enabled: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
  }
);

// Crear el modelo
const User = mongoose.model<User>("User", userSchema);

export default User;
