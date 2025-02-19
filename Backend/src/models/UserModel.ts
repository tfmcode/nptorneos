import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document {
  _id: mongoose.Types.ObjectId; // 🔹 Agregar `_id` explícitamente
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "admin" | "staff" | "user";
  enabled: boolean;
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff", "user"], required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🔒 Encriptar la contraseña antes de guardarla
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Método para comparar contraseñas
userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export { User, IUser };
